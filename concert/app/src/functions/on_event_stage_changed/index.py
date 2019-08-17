import boto3
import json
import os
from copy import copy
from enchanted_brain.attributes import (
    ATTR_DISPLAY_NAME,
    ATTR_EVENT_STAGE_ID,
    ATTR_END_TIME,
    ATTR_RECORD_ID,
    ATTR_SONGS,
    ATTR_START_TIME,
    RECORD_ID_EVENT_STAGE,
    RECORD_ID_SONG_LIST,
)

CALLBACK_GLOBAL_SNS_TOPIC_ARN = os.environ["CALLBACK_GLOBAL_SNS_TOPIC_ARN"]
DYNAMODB_TABLE_NAME = os.environ.get("DYNAMODB_TABLE_NAME")
DYNAMODB_ENDPOINT = os.environ.get("DYNAMODB_ENDPOINT")

dynamodb_args = {}
if DYNAMODB_ENDPOINT:
    dynamodb_args["endpoint_url"] = DYNAMODB_ENDPOINT

sns = boto3.client("sns")
dynamodb = boto3.resource("dynamodb", **dynamodb_args)
table = dynamodb.Table(DYNAMODB_TABLE_NAME)


def handler(event, context):
    message = json.loads(event["body"])

    stage_record_update_response = update_stage_record(message)

    sns_response = sns.publish(
        TopicArn=CALLBACK_GLOBAL_SNS_TOPIC_ARN,
        Message=json.dumps(message),
        MessageStructure="string",
    )

    song_list_update_response = update_song_list(message)

    return {"statusCode": 204}


def update_song_list(message):
    response = None

    data = message["data"]
    display_name = data.get(ATTR_DISPLAY_NAME)
    start_time = data.get(ATTR_START_TIME)
    end_time = data.get(ATTR_END_TIME)
    if display_name and start_time and end_time:

        song = [
            {
                ATTR_DISPLAY_NAME: display_name,
                ATTR_START_TIME: start_time,
                ATTR_END_TIME: end_time,
            }
        ]

        update_args = {
            "Key": {ATTR_RECORD_ID: RECORD_ID_SONG_LIST},
            "UpdateExpression": "SET #songs = list_append(#songs, :song)",
            "ExpressionAttributeNames": {"#songs": ATTR_SONGS},
            "ExpressionAttributeValues": {":song": song},
            "ReturnValues": "NONE",
        }

        response = table.update_item(**update_args)

    return response


def update_stage_record(message):
    data = copy(message["data"])
    stage_id = data.pop(ATTR_EVENT_STAGE_ID)

    update_args = {
        "Key": {ATTR_RECORD_ID: RECORD_ID_EVENT_STAGE},
        "UpdateExpression": "SET #stage_id = :stage_id",
        "ExpressionAttributeNames": {"#stage_id": ATTR_EVENT_STAGE_ID},
        "ExpressionAttributeValues": {":stage_id": stage_id},
        "ReturnValues": "NONE",
    }

    for key, value in data.items():
        update_args["UpdateExpression"] += ", #{} = :{}".format(key, key)
        update_args["ExpressionAttributeNames"]["#{}".format(key)] = key
        update_args["ExpressionAttributeValues"][":{}".format(key)] = value

    return table.update_item(**update_args)
