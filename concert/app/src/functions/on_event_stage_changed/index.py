import boto3
import json
import os
from copy import copy
from enchanted_brain.attributes import (
    ATTR_EVENT_STAGE_ID,
    ATTR_RECORD_ID,
    ATTR_SONG_LIST_DISPLAY_NAME,
    ATTR_SONG_LIST_END_TIME,
    ATTR_SONG_LIST_SONGS,
    ATTR_SONG_LIST_START_TIME,
    RECORD_ID_EVENT_STAGE,
    RECORD_ID_SONG_LIST,
)

CALLBACK_GLOBAL_SNS_TOPIC_ARN = os.environ["CALLBACK_GLOBAL_SNS_TOPIC_ARN"]
DYNAMODB_TABLE_NAME = os.environ.get("DYNAMODB_TABLE_NAME")

sns = boto3.client("sns")
dynamodb = boto3.client("dynamodb")


def handler(event, context):
    message = json.loads(event["body"])

    update_event_stage_and_song_list(message)

    sns.publish(
        TopicArn=CALLBACK_GLOBAL_SNS_TOPIC_ARN,
        Message=json.dumps(message),
        MessageStructure="string",
    )

    return {"statusCode": 204}


def update_event_stage_and_song_list(message):
    data = copy(message["data"])

    event_stage_put_transaction_item = get_event_stage_put_transaction_item(data)
    song_list_update_transaction_item = get_song_list_update_transaction_item(data)

    transaction_items = [event_stage_put_transaction_item]
    if song_list_update_transaction_item:
        transaction_items.append(song_list_update_transaction_item)

    return dynamodb.transact_write_items(TransactItems=transaction_items)


def get_event_stage_put_transaction_item(message_data):
    stage_id = message_data.pop(ATTR_EVENT_STAGE_ID)

    event_stage_update_args = {
        "Item": {
            ATTR_RECORD_ID: {"S": RECORD_ID_EVENT_STAGE},
            ATTR_EVENT_STAGE_ID: {"S": stage_id},
        },
        "TableName": DYNAMODB_TABLE_NAME,
    }

    for key, value in message_data.items():
        if isinstance(value, int):
            value_data_type = "N"
            value = str(value)
        else:
            value_data_type = "S"
        event_stage_update_args["Item"][key] = {value_data_type: value}

    return {"Put": event_stage_update_args}


def get_song_list_update_transaction_item(message_data):
    display_name = message_data.get(ATTR_SONG_LIST_DISPLAY_NAME)
    start_time = message_data.get(ATTR_SONG_LIST_START_TIME)
    end_time = message_data.get(ATTR_SONG_LIST_END_TIME)

    if not (display_name and start_time and end_time):
        return

    song = [
        {
            "M": {
                ATTR_SONG_LIST_DISPLAY_NAME: {"S": display_name},
                ATTR_SONG_LIST_START_TIME: {"S": start_time},
                ATTR_SONG_LIST_END_TIME: {"S": end_time},
            }
        }
    ]

    song_list_update_args = {
        "Key": {ATTR_RECORD_ID: {"S": RECORD_ID_SONG_LIST}},
        "UpdateExpression": "SET #songs = list_append(if_not_exists(#songs, :empty_list), :song)",
        "ExpressionAttributeNames": {"#songs": ATTR_SONG_LIST_SONGS},
        "ExpressionAttributeValues": {":song": {"L": song}, ":empty_list": {"L": []}},
        "TableName": DYNAMODB_TABLE_NAME,
    }

    return {"Update": song_list_update_args}
