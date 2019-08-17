import json
import os
import pytest
from botocore.exceptions import ClientError
from botocore.stub import Stubber
from src.functions.on_event_stage_changed.index import handler, sns, dynamodb

CALLBACK_SNS_ARN = os.environ["CALLBACK_GLOBAL_SNS_TOPIC_ARN"]
TABLE_NAME = os.environ.get("DYNAMODB_TABLE_NAME")

SUCCESS_RESPONSE = {"ResponseMetadata": {"HTTPStatusCode": 200}}


def get_event(
    stageId="STAGE_CHOICE_COLOR_EMOTION",
    display_name=None,
    start_time=None,
    end_time=None,
    frequency=None,
):
    data = {"stageId": stageId}
    if display_name:
        data["displayName"] = display_name
    if start_time:
        data["startTime"] = start_time
    if end_time:
        data["endTime"] = end_time
    if frequency:
        data["frequency"] = frequency
    return {"body": json.dumps({"event": "EVENT_STAGE_CHANGED", "data": data})}


@pytest.mark.parametrize(
    "stage_id, display_name, start_time, end_time, frequency",
    [
        (
            "STAGE_CHOICE_COLOR_EMOTION",
            "Canon in D",
            "2019-05-14T21:20:03.000Z",
            "2019-05-14T21:21:33.000Z",
            20,
        )
    ],
)
def test_event_stage_changed(stage_id, display_name, start_time, end_time, frequency):
    event = get_event(stage_id, display_name, start_time, end_time, frequency)

    sns_expected_params = {
        "TopicArn": CALLBACK_SNS_ARN,
        "Message": event["body"],
        "MessageStructure": "string",
    }

    dynamo_song_list_expected_params = {
        "TableName": TABLE_NAME,
        "Key": {"recordId": "SONG_LIST"},
        "UpdateExpression": "SET #songs = list_append(#songs, :song)",
        "ExpressionAttributeNames": {"#songs": "songs"},
        "ExpressionAttributeValues": {
            ":song": [
                {
                    "displayName": display_name,
                    "startTime": start_time,
                    "endTime": end_time,
                }
            ]
        },
        "ReturnValues": "NONE",
    }

    dynamo_event_stage_expected_params = {
        "TableName": TABLE_NAME,
        "Key": {"recordId": "EVENT_STAGE"},
        "UpdateExpression": "SET #stage_id = :stage_id, #displayName = :displayName, #startTime = :startTime, #endTime = :endTime, #frequency = :frequency",
        "ExpressionAttributeNames": {
            "#displayName": "displayName",
            "#stage_id": "stageId",
            "#startTime": "startTime",
            "#endTime": "endTime",
            "#frequency": "frequency",
        },
        "ExpressionAttributeValues": {
            ":stage_id": stage_id,
            ":displayName": display_name,
            ":startTime": start_time,
            ":endTime": end_time,
            ":frequency": frequency,
        },
        "ReturnValues": "NONE",
    }

    resp = None
    with Stubber(sns) as sns_stub, Stubber(dynamodb.meta.client) as dynamo_stub:
        sns_stub.add_response("publish", SUCCESS_RESPONSE, sns_expected_params)

        dynamo_stub.add_response(
            "update_item", SUCCESS_RESPONSE, dynamo_event_stage_expected_params
        )

        if display_name and start_time and end_time:
            dynamo_stub.add_response(
                "update_item", SUCCESS_RESPONSE, dynamo_song_list_expected_params
            )

        resp = handler(event, None)
        sns_stub.assert_no_pending_responses()
        dynamo_stub.assert_no_pending_responses()

    assert resp == {"statusCode": 204}


def test_sns_publish_error_raises_client_error():
    with pytest.raises(ClientError):
        with Stubber(sns) as sns_stub, Stubber(dynamodb.meta.client) as dynamo_stub:
            dynamo_stub.add_response("update_item", SUCCESS_RESPONSE)
            sns_stub.add_client_error("publish")
            handler(get_event(), None)


def test_dynamodb_update_error_raises_client_error():
    with pytest.raises(ClientError):
        with Stubber(sns) as sns_stub, Stubber(dynamodb.meta.client) as dynamo_stub:
            dynamo_stub.add_client_error("update_item")
            handler(get_event(), None)
