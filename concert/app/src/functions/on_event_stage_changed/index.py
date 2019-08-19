import boto3
import json
import os
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
    data = message["data"]

    event_stage_put_transaction_item = get_event_stage_put_transaction_item(data)
    song_list_update_transaction_item = get_song_list_update_transaction_item(data)

    transaction_items = [event_stage_put_transaction_item]
    if song_list_update_transaction_item:
        transaction_items.append(song_list_update_transaction_item)

    return dynamodb.transact_write_items(TransactItems=transaction_items)


def get_event_stage_put_transaction_item(message_data):
    serializer = boto3.dynamodb.types.TypeSerializer()
    event_stage_update_args = {
        "Item": {k: serializer.serialize(v) for k, v in message_data.items()},
        "TableName": DYNAMODB_TABLE_NAME,
    }
    event_stage_update_args["Item"][ATTR_RECORD_ID] = serializer.serialize(
        RECORD_ID_EVENT_STAGE
    )

    return {"Put": event_stage_update_args}


def get_song_list_update_transaction_item(message_data):
    display_name = message_data.get(ATTR_SONG_LIST_DISPLAY_NAME)
    start_time = message_data.get(ATTR_SONG_LIST_START_TIME)
    end_time = message_data.get(ATTR_SONG_LIST_END_TIME)

    if not (display_name and start_time and end_time):
        return

    song = [
        {
            ATTR_SONG_LIST_DISPLAY_NAME: display_name,
            ATTR_SONG_LIST_START_TIME: start_time,
            ATTR_SONG_LIST_END_TIME: end_time,
        }
    ]

    serializer = boto3.dynamodb.types.TypeSerializer()
    song_list_update_args = {
        "Key": {ATTR_RECORD_ID: serializer.serialize(RECORD_ID_SONG_LIST)},
        "UpdateExpression": "SET #songs = list_append(if_not_exists(#songs, :empty_list), :song)",
        "ExpressionAttributeNames": {"#songs": ATTR_SONG_LIST_SONGS},
        "ExpressionAttributeValues": {
            ":song": serializer.serialize(song),
            ":empty_list": serializer.serialize([]),
        },
        "TableName": DYNAMODB_TABLE_NAME,
    }

    return {"Update": song_list_update_args}
