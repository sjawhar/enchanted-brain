import json
import os
import pytest
from botocore.stub import Stubber
from src.functions.on_disconnect.index import (
    handler,
    client_lambda,
    client_sns,
    client_sqs,
    table,
)

DYNAMODB_TABLE_NAME = os.environ.get("DYNAMODB_TABLE_NAME")


@pytest.fixture
def get_event():
    def _get_event(connection_id="test-connection="):
        return {"requestContext": {"connectionId": connection_id}}

    return _get_event


def run_handler(
    event,
    get_item_params=None,
    delete_item_params=None,
    lambda_mapping_uuid="mapping-uuid",
    lambda_params=None,
    sns_params=None,
    sns_subscription_arns=["subscription-arn"],
    sqs_params=None,
    sqs_queue_url="https://test.com/queue",
):
    get_item_response = {
        "Item": {
            "lambdaMappingUuid": {"S": lambda_mapping_uuid},
            "snsSubscriptionArns": {"SS": sns_subscription_arns},
            "sqsQueueUrl": {"S": sqs_queue_url},
        }
    }
    stubber_dynamodb = Stubber(table.meta.client)
    stubber_dynamodb.add_response("get_item", get_item_response, get_item_params)
    stubber_dynamodb.add_response("delete_item", {}, delete_item_params)

    stubber_sns = Stubber(client_sns)
    for param in sns_params or sns_subscription_arns:
        if sns_params is None:
            param = {"SubscriptionArn": param}
        stubber_sns.add_response("unsubscribe", {}, param)

    stubber_sqs = Stubber(client_sqs)
    stubber_sqs.add_response("delete_queue", {}, sqs_params)

    stubber_lambda = Stubber(client_lambda)
    stubber_lambda.add_response("delete_event_source_mapping", {}, lambda_params)

    with stubber_lambda, stubber_dynamodb, stubber_sqs, stubber_sns:
        response = handler(event, {})

    stubber_dynamodb.assert_no_pending_responses()
    stubber_sns.assert_no_pending_responses()
    stubber_sqs.assert_no_pending_responses()
    stubber_lambda.assert_no_pending_responses()

    return response


def test_connection_record_is_retrieved(get_event):
    event = get_event(connection_id="connection-record=")
    run_handler(
        event,
        get_item_params={
            "TableName": DYNAMODB_TABLE_NAME,
            "Key": {"recordId": "CONN$connection-record="},
        },
    )


def test_connection_record_is_deleted(get_event):
    event = get_event(connection_id="delete-record=")
    run_handler(
        event,
        delete_item_params={
            "TableName": DYNAMODB_TABLE_NAME,
            "Key": {"recordId": "CONN$delete-record="},
        },
    )


def test_sns_subscriptions_are_deleted(get_event):
    event = get_event()
    run_handler(
        event,
        sns_subscription_arns=["subscription-one", "subscription-two"],
        sns_params=[
            {"SubscriptionArn": "subscription-one"},
            {"SubscriptionArn": "subscription-two"},
        ],
    )


def test_sqs_queue_is_deleted(get_event):
    event = get_event()
    run_handler(
        event,
        sqs_queue_url="https://delete-this-queue.com",
        sqs_params={"QueueUrl": "https://delete-this-queue.com"},
    )


def test_lambda_event_source_mapping_is_deleted(get_event):
    event = get_event()
    run_handler(
        event,
        lambda_mapping_uuid="this-is-super-unique",
        lambda_params={"UUID": "this-is-super-unique"},
    )
