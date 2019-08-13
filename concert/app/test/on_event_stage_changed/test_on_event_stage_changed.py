import json
import os
import pytest
from botocore.exceptions import ClientError
from botocore.stub import Stubber
from src.functions.on_event_stage_changed.index import handler, sns, dynamodb

CALLBACK_SNS_ARN = os.environ["CALLBACK_GLOBAL_SNS_TOPIC_ARN"]
TABLE_NAME = os.environ.get("DYNAMODB_TABLE_NAME")

SUCCESS_RESPONSE = {"ResponseMetadata": {"HTTPStatusCode": 200}}


def get_event(stageId="STAGE_CHOICE_COLOR_EMOTION", otherAttributes=None):
    data = {"stageId": stageId}
    if otherAttributes:
        for key, value in otherAttributes.items():
            data[key] = value
    return {"body": json.dumps({"event": "EVENT_STAGE_CHANGED", "data": (data)})}


def test_event_stage_changed():
    stageId = "STAGE_CHOICE_COLOR_EMOTION"
    otherAttributes = {
        "startTime": "2019-05-14T21:20:03.000Z",
        "endTime": "2019-05-14T21:21:33.000Z",
        "frequency": 20,
    }
    event = get_event(stageId, otherAttributes)

    expectedMessage = json.dumps(
        {
            "event": "EVENT_STAGE_CHANGED",
            "data": {
                "stageId": stageId,
                "startTime": otherAttributes["startTime"],
                "endTime": otherAttributes["endTime"],
                "frequency": otherAttributes["frequency"],
            },
        }
    )

    sns_expected_params = {
        "TopicArn": CALLBACK_SNS_ARN,
        "Message": expectedMessage,
        "MessageStructure": "string",
        "MessageAttributes": {
            "connection_type": {"DataType": "String", "StringValue": "GLOBAL"}
        },
    }

    dynamo_expected_params = {
        "TableName": TABLE_NAME,
        "Key": {"recordId": "EVENT_STAGE"},
        "UpdateExpression": "SET #stage_id = :stage_id, #startTime = :startTime, #endTime = :endTime, #frequency = :frequency",
        "ExpressionAttributeNames": {
            "#stage_id": "stageId",
            "#startTime": "startTime",
            "#endTime": "endTime",
            "#frequency": "frequency",
        },
        "ExpressionAttributeValues": {
            ":stage_id": stageId,
            ":startTime": otherAttributes["startTime"],
            ":endTime": otherAttributes["endTime"],
            ":frequency": otherAttributes["frequency"],
        },
        "ReturnValues": "NONE",
    }

    resp = None
    with Stubber(sns) as sns_stub, Stubber(dynamodb.meta.client) as dynamo_stub:
        sns_stub.add_response("publish", SUCCESS_RESPONSE, sns_expected_params)
        dynamo_stub.add_response(
            "update_item", SUCCESS_RESPONSE, dynamo_expected_params
        )

        resp = handler(event, None)
        sns_stub.assert_no_pending_responses()
        dynamo_stub.assert_no_pending_responses()
    assert resp == {"statusCode": 204}


def test_sns_publish_error_raises_client_error():
    with pytest.raises(ClientError):
        with Stubber(sns) as sns_stub:
            sns_stub.add_client_error(
                "publish",
                service_message="Jeff Bezos dislikes you personally and has sabotaged your SNS endpoint",
                service_error_code=500,
            )
            handler(get_event(), None)


def test_dynamodb_update_error_raises_client_error():
    with pytest.raises(ClientError):
        with Stubber(sns) as sns_stub, Stubber(dynamodb.meta.client) as dynamo_stub:
            sns_stub.add_response("publish", SUCCESS_RESPONSE)
            dynamo_stub.add_client_error(
                "update_item",
                service_message="Jeff Bezos dislikes you personally and has sabotaged your Dynamo endpoint",
                service_error_code=500,
            )
            handler(get_event(), None)
