import json
import os
import pytest
from boto3.dynamodb.conditions import Attr
from botocore.exceptions import ClientError
from botocore.stub import ANY, Stubber
from src.functions.on_connect.index import (
    handler,
    client_lambda,
    client_sns,
    client_sqs,
    table,
)

CALLBACK_FUNCTION_ARN = os.environ.get("CALLBACK_FUNCTION_ARN")
CALLBACK_SNS_TOPIC_ARN = os.environ.get("CALLBACK_SNS_TOPIC_ARN")
CALLBACK_SQS_QUEUE_ARN_PREFIX = os.environ.get("CALLBACK_SQS_QUEUE_ARN_PREFIX")
DYNAMODB_TABLE_NAME = os.environ.get("DYNAMODB_TABLE_NAME")


@pytest.fixture
def get_event():
    def _get_event(
        choice_inverted=False,
        choice_type="CHOICE_COLOR",
        connection_id="test-connection=",
        principal_id="test-user",
    ):
        return {
            "requestContext": {
                "connectionId": connection_id,
                "authorizer": {
                    "principalId": principal_id,
                    "choiceType": choice_type,
                    "choiceInverted": choice_inverted,
                },
            }
        }

    return _get_event


def run_handler(
    event,
    choice_error_code=None,
    choice_params=None,
    connection_params=None,
    dynamodb_response=None,
    lambda_params=None,
    lambda_response=None,
    sns_params=None,
    sns_response=None,
    sqs_params=None,
    sqs_response=None,
    stage_params=None,
    stage_response=None,
):
    stubber_sqs = Stubber(client_sqs)
    if sqs_response is None:
        sqs_response = {"QueueUrl": "https://queue.amazonaws.com/account-id/test-queue"}
    stubber_sqs.add_response("create_queue", sqs_response, sqs_params)

    stubber_lambda = Stubber(client_lambda)
    if lambda_response is None:
        lambda_response = {"UUID": "event-source-mapping"}
    stubber_lambda.add_response(
        "create_event_source_mapping", lambda_response, lambda_params
    )

    stubber_sns = Stubber(client_sns)
    if sns_response is None:
        sns_response = {
            "SubscriptionArn": "arn:aws:sns:region:account-id:testing-enchanted-brain-callback:uuid"
        }
    stubber_sns.add_response("subscribe", sns_response, sns_params)

    stubber_dynamodb = Stubber(table.meta.client)
    if dynamodb_response is None:
        dynamodb_response = {"ResponseMetadata": {"HTTPStatusCode": 200}}
    stubber_dynamodb.add_response("put_item", dynamodb_response, connection_params)

    if choice_error_code is not None:
        stubber_dynamodb.add_client_error(
            "put_item",
            expected_params=choice_params,
            service_error_code=choice_error_code,
        )
    else:
        stubber_dynamodb.add_response("put_item", dynamodb_response, choice_params)

    if stage_response is None:
        stage_response = {
            "Item": {
                "recordId": {"S": "EVENT_STAGE"},
                "stageId": {"S": "STAGE_WAITING"},
            }
        }
    stubber_dynamodb.add_response("get_item", dict(stage_response), stage_params)

    with stubber_dynamodb, stubber_lambda, stubber_sns, stubber_sqs:
        response = handler(event, {})

        stubber_dynamodb.assert_no_pending_responses()
        stubber_lambda.assert_no_pending_responses()
        stubber_sns.assert_no_pending_responses()
        stubber_sqs.assert_no_pending_responses()

    return response


def test_sqs_queue_is_created_with_connection_id(get_event):
    event = get_event(connection_id="sqs-connection=")
    run_handler(
        event,
        sqs_params={
            "QueueName": "testing-enchanted-brain-callback-sqs-connection",
            "Attributes": {
                "Policy": json.dumps(
                    {
                        "Version": "2012-10-17",
                        "Statement": [
                            {
                                "Effect": "Allow",
                                "Action": "sqs:SendMessage",
                                "Resource": "{}-{}".format(
                                    CALLBACK_SQS_QUEUE_ARN_PREFIX, "sqs-connection"
                                ),
                                "Principal": "*",
                                "Condition": {
                                    "ArnEquals": {
                                        "aws:SourceArn": CALLBACK_SNS_TOPIC_ARN
                                    }
                                },
                            }
                        ],
                    }
                )
            },
        },
    )


def test_lambda_event_source_mapping_is_created_with_sqs_queue_arn(get_event):
    event = get_event(connection_id="lambda-connection=")
    run_handler(
        event,
        lambda_params={
            "EventSourceArn": "{}-{}".format(
                CALLBACK_SQS_QUEUE_ARN_PREFIX, "lambda-connection"
            ),
            "FunctionName": CALLBACK_FUNCTION_ARN,
            "Enabled": True,
            "BatchSize": 1,
        },
    )


def test_sns_subscription_is_created_with_sqs_queue_arn(get_event):
    event = get_event(connection_id="sns-connection=")
    run_handler(
        event,
        sns_params={
            "TopicArn": CALLBACK_SNS_TOPIC_ARN,
            "Protocol": "sqs",
            "Endpoint": "{}-{}".format(CALLBACK_SQS_QUEUE_ARN_PREFIX, "sns-connection"),
            "Attributes": {"RawMessageDelivery": "true"},
            "ReturnSubscriptionArn": True,
        },
    )


def test_connection_record_is_written_with_resource_ids(get_event):
    event = get_event(connection_id="connection-id=")
    queue_url = "https://test.com/choice-queue"
    event_source_mapping_uuid = "choice-event-source-mapping"
    subscription_arn = "arn:aws:sns:subscription:choice-subscription-arn"
    run_handler(
        event,
        sqs_response={"QueueUrl": queue_url},
        lambda_response={"UUID": event_source_mapping_uuid},
        sns_response={"SubscriptionArn": subscription_arn},
        connection_params={
            "Item": {
                "recordId": "CONN$connection-id=",
                "createdAt": ANY,
                "lambdaMappingUuid": event_source_mapping_uuid,
                "sqsQueueUrl": queue_url,
                "snsSubscriptionArn": subscription_arn,
            },
            "TableName": DYNAMODB_TABLE_NAME,
        },
    )


def test_choice_record_is_prepared(get_event):
    event = get_event(principal_id="choice-record-user")
    run_handler(
        event,
        choice_params={
            "ConditionExpression": Attr("recordId").not_exists(),
            "Item": {
                "recordId": "CHOICE$choice-record-user",
                "createdAt": ANY,
                "chills": {},
                "colors": {},
                "emotions": {},
            },
            "TableName": DYNAMODB_TABLE_NAME,
        },
    )


def test_if_choice_record_exists_no_error_is_raised(get_event):
    event = get_event()
    response = run_handler(
        event,
        choice_params={"ConditionExpression": ANY, "Item": ANY, "TableName": ANY},
        choice_error_code="ConditionalCheckFailedException",
    )
    assert response["statusCode"] == 200


def test_event_stage_record_is_retrieved(get_event):
    event = get_event()
    run_handler(
        event,
        stage_params={
            "TableName": DYNAMODB_TABLE_NAME,
            "Key": {"recordId": "EVENT_STAGE"},
        },
    )


def test_response_includes_connected_event_and_choice_data(get_event):
    event = get_event(choice_type="CHOICE_AWESOME", choice_inverted=True)
    response = run_handler(
        event,
        stage_response={
            "Item": {
                "recordId": {"S": "EVENT_STAGE"},
                "stageId": {"S": "STAGE_AMAZING"},
                "powerLevel": {"N": "9001"},
            }
        },
    )
    assert response["statusCode"] == 200
    assert json.loads(response["body"]) == {
        "event": "CONNECTED",
        "data": {
            "choiceType": "CHOICE_AWESOME",
            "choiceInverted": True,
            "stageId": "STAGE_AMAZING",
            "powerLevel": 9001,
        },
    }


def test_if_not_event_stage_record_stage_id_is_waiting(get_event):
    event = get_event(choice_type="CHOICE_MISSING", choice_inverted=False)
    response = run_handler(event, stage_response={})
    assert response["statusCode"] == 200
    assert json.loads(response["body"]) == {
        "event": "CONNECTED",
        "data": {
            "choiceType": "CHOICE_MISSING",
            "choiceInverted": False,
            "stageId": "STAGE_WAITING",
        },
    }
