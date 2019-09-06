import json
import os
import pytest
import mock
from botocore.exceptions import ClientError
from botocore.stub import Stubber
from src.functions.prepare_stack.index import handler, dynamodb, kinesis_analytics


table_name = os.environ.get("DYNAMODB_TABLE_NAME")
kinesis_analytics_application_name = os.environ.get(
    "KINESIS_ANALYTICS_APPLICATION_NAME"
)

success_response = {"ResponseMetadata": {"HTTPStatusCode": 200}}

event = {
    "ResponseURL": "http://pre-signed-S3-url-for-response",
    "StackId": "arn:aws:cloudformation:us-west-2:123456789012:stack/stack-name/guid",
    "RequestId": "unique id for this request",
    "LogicalResourceId": "MyTestResource",
}
context = type("obj", (object,), {"log_stream_name": "log stream name"})


def test_aggregate_row_prepared():
    expected_params = {
        "TableName": table_name,
        "Key": {"recordId": "AGGREGATE"},
        "UpdateExpression": "SET #chills_map = if_not_exists(#chills_map, :empty_map), #colors_map = if_not_exists(#colors_map, :empty_map), #emotions_map = if_not_exists(#emotions_map, :empty_map)",
        "ExpressionAttributeNames": {
            "#chills_map": "chills",
            "#colors_map": "colors",
            "#emotions_map": "emotions",
        },
        "ExpressionAttributeValues": {":empty_map": {}},
        "ReturnValues": "NONE",
    }

    resp = None
    with Stubber(dynamodb.meta.client) as dynamodb_stub, Stubber(
        kinesis_analytics
    ) as kinesis_analytics_stub:
        dynamodb_stub.add_response("update_item", success_response, expected_params)
        kinesis_analytics_stub.add_response("start_application", success_response)
        resp = handler(event, context)
        dynamodb_stub.assert_no_pending_responses()

    assert resp == {"statusCode": 204}


def test_kinesis_analytics_application_started():
    expected_params = {
        "ApplicationName": kinesis_analytics_application_name,
        "RunConfiguration": {
            "SqlRunConfigurations": [
                {
                    "InputId": "1.1",
                    "InputStartingPositionConfiguration": {
                        "InputStartingPosition": "NOW"
                    },
                }
            ]
        },
    }

    resp = None
    with Stubber(dynamodb.meta.client) as dynamodb_stub, Stubber(
        kinesis_analytics
    ) as kinesis_analytics_stub:
        dynamodb_stub.add_response("update_item", success_response)
        kinesis_analytics_stub.add_response(
            "start_application", success_response, expected_params
        )
        resp = handler(event, context)
        kinesis_analytics_stub.assert_no_pending_responses()

    assert resp == {"statusCode": 204}


@mock.patch('botocore.vendored.requests.put', return_value=success_response)
def test_response_sent_to_s3(put_function):
    expected_params = {
        "data": json.dumps({
            "Status": "SUCCESS",
            "Reason": "See the details in CloudWatch Log Stream: log stream name",
            "StackId": "arn:aws:cloudformation:us-west-2:123456789012:stack/stack-name/guid",
            "RequestId": "unique id for this request",
            "LogicalResourceId": "MyTestResource",
            "PhysicalResourceId": "MyTestResource"}),
        "headers": {"content-length": "296", "content-type": ""}
    }
    resp = None
    with Stubber(dynamodb.meta.client) as dynamodb_stub, Stubber(
        kinesis_analytics
    ) as kinesis_analytics_stub:
        dynamodb_stub.add_response("update_item", success_response)
        kinesis_analytics_stub.add_response(
            "start_application", success_response
        )
        resp = handler(event, context)
        assert put_function.called
        request_args, requests_kwargs = put_function.call_args
        assert requests_kwargs == expected_params

    assert resp == {"statusCode": 204}


@mock.patch('botocore.vendored.requests.put', return_value=success_response)
def test_failure_response_sent_to_s3_on_error(put_function):
    expected_params = {
        "data": json.dumps({
            "Status": "FAILED",
            "Reason": "See the details in CloudWatch Log Stream: log stream name",
            "StackId": "arn:aws:cloudformation:us-west-2:123456789012:stack/stack-name/guid",
            "RequestId": "unique id for this request",
            "LogicalResourceId": "MyTestResource",
            "PhysicalResourceId": "MyTestResource"}),
        "headers": {"content-length": "295", "content-type": ""}
    }

    with pytest.raises(ClientError):
        with Stubber(dynamodb.meta.client) as dynamodb_stub, Stubber(
            kinesis_analytics
        ) as kinesis_analytics_stub:
            dynamodb_stub.add_client_error("update_item")
            resp = handler(event, context)

    assert put_function.called
    request_args, requests_kwargs = put_function.call_args
    assert requests_kwargs == expected_params
