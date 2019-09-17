import boto3
import json
import os
from boto3.dynamodb import types
from decimal import Decimal
from enchanted_brain.attributes import (
    ATTR_AGGREGATE_CHOICE_COUNT,
    ATTR_AGGREGATE_CHOICE_SUM,
    ATTR_CHOICE_TIMESTAMP,
    ATTR_CHOICE_TYPE,
    ATTR_CHOICE_VALUE_CHILLS,
    ATTR_CHOICE_VALUE_COLOR,
    ATTR_EVENT_STAGE_ID,
    ATTR_RECORD_ID,
    ATTR_SONG_LIST_CHOICES,
    ATTR_SONG_LIST_DISPLAY_NAME,
    ATTR_SONG_LIST_END_TIME,
    ATTR_SONG_LIST_SONGS,
    ATTR_SONG_LIST_START_TIME,
    CHOICE_CHILLS,
    CHOICE_COLOR,
    EVENT_STAGE_END,
    RECORD_ID_AGGREGATE,
    RECORD_ID_EVENT_STAGE,
    RECORD_ID_SONG_LIST,
)
from enchanted_brain.parser import DynamoDbEncoder

CALLBACK_GLOBAL_SNS_TOPIC_ARN = os.environ["CALLBACK_GLOBAL_SNS_TOPIC_ARN"]
DYNAMODB_TABLE_NAME = os.environ.get("DYNAMODB_TABLE_NAME")

sns = boto3.client("sns")
dynamodb = boto3.client("dynamodb")

dynamodb_serializer = boto3.dynamodb.types.TypeSerializer()
dynamodb_deserializer = boto3.dynamodb.types.TypeDeserializer()


def handler(event, context):
    message = json.loads(event["body"])

    if message["data"][ATTR_EVENT_STAGE_ID] == EVENT_STAGE_END:
        song_list, aggregate_data = get_song_list_and_aggregate_data()
        message["data"][ATTR_SONG_LIST_SONGS] = get_songs_with_aggregate_choices(
            song_list, aggregate_data
        )

    update_event_stage_and_song_list(message)

    sns.publish(
        TopicArn=CALLBACK_GLOBAL_SNS_TOPIC_ARN,
        Message=json.dumps(message, cls=DynamoDbEncoder),
        MessageStructure="string",
    )

    return {"statusCode": 204}


def update_event_stage_and_song_list(message):
    data = message["data"]

    transaction_items = [get_event_stage_put_transaction_item(data)]
    song_list_update_transaction_item = get_song_list_update_transaction_item(data)
    if song_list_update_transaction_item is not None:
        transaction_items.append(song_list_update_transaction_item)

    return dynamodb.transact_write_items(TransactItems=transaction_items)


def get_event_stage_put_transaction_item(message_data):
    serialized_data = json.loads(
        json.dumps(message_data, cls=DynamoDbEncoder), parse_float=Decimal
    )
    event_stage_update_args = {
        "Item": {
            k: dynamodb_serializer.serialize(v) for k, v in serialized_data.items()
        },
        "TableName": DYNAMODB_TABLE_NAME,
    }
    event_stage_update_args["Item"][ATTR_RECORD_ID] = dynamodb_serializer.serialize(
        RECORD_ID_EVENT_STAGE
    )

    return {"Put": event_stage_update_args}


def get_song_list_update_transaction_item(message_data):
    display_name = message_data.get(ATTR_SONG_LIST_DISPLAY_NAME)
    start_time = message_data.get(ATTR_SONG_LIST_START_TIME)
    end_time = message_data.get(ATTR_SONG_LIST_END_TIME)

    if not (display_name and start_time and end_time):
        return None

    song = [
        {
            ATTR_SONG_LIST_DISPLAY_NAME: display_name,
            ATTR_SONG_LIST_START_TIME: start_time,
            ATTR_SONG_LIST_END_TIME: end_time,
        }
    ]

    return {
        "Update": {
            "Key": {ATTR_RECORD_ID: dynamodb_serializer.serialize(RECORD_ID_SONG_LIST)},
            "UpdateExpression": "SET #songs = list_append(if_not_exists(#songs, :empty_list), :song)",
            "ExpressionAttributeNames": {"#songs": ATTR_SONG_LIST_SONGS},
            "ExpressionAttributeValues": {
                ":song": dynamodb_serializer.serialize(song),
                ":empty_list": dynamodb_serializer.serialize([]),
            },
            "TableName": DYNAMODB_TABLE_NAME,
        }
    }


def get_get_transaction_item(record_id):
    return {
        "Get": {
            "Key": {ATTR_RECORD_ID: dynamodb_serializer.serialize(record_id)},
            "TableName": DYNAMODB_TABLE_NAME,
        }
    }


def get_song_list_and_aggregate_data():
    transact_get_items_responses = dynamodb.transact_get_items(
        TransactItems=[
            get_get_transaction_item(RECORD_ID_SONG_LIST),
            get_get_transaction_item(RECORD_ID_AGGREGATE),
        ]
    )["Responses"]

    songs = deserialize_db_item(transact_get_items_responses[0])
    aggregate_data = deserialize_db_item(transact_get_items_responses[1])

    return songs, aggregate_data


def get_songs_with_aggregate_choices(song_list, aggregate_data):
    songs_with_aggregate_choices = []
    for song_metadata in song_list[ATTR_SONG_LIST_SONGS]:
        display_name = song_metadata[ATTR_SONG_LIST_DISPLAY_NAME]
        start_time = song_metadata[ATTR_SONG_LIST_START_TIME]
        end_time = song_metadata[ATTR_SONG_LIST_END_TIME]

        choice_type = CHOICE_CHILLS
        choice_key = ATTR_CHOICE_VALUE_CHILLS
        for timestamp in aggregate_data[ATTR_CHOICE_VALUE_COLOR].keys():
            if start_time <= timestamp < end_time:
                choice_type = CHOICE_COLOR
                choice_key = ATTR_CHOICE_VALUE_COLOR
                break

        choices = []
        for timestamp, aggregate_choice_data in aggregate_data[choice_key].items():
            if not (start_time <= timestamp < end_time):
                continue
            choices_at_timestamp = {ATTR_CHOICE_TIMESTAMP: timestamp}
            choices.append(choices_at_timestamp)
            if choice_type == CHOICE_CHILLS:
                choices_at_timestamp.update(aggregate_choice_data)
                continue
            choices_at_timestamp.update(
                {
                    k[4:]: v
                    for k, v in aggregate_choice_data.items()
                    if str.startswith(k, ATTR_AGGREGATE_CHOICE_SUM)
                }
            )

        songs_with_aggregate_choices.append(
            {
                ATTR_SONG_LIST_DISPLAY_NAME: display_name,
                ATTR_SONG_LIST_START_TIME: start_time,
                ATTR_SONG_LIST_END_TIME: end_time,
                ATTR_CHOICE_TYPE: choice_type,
                ATTR_SONG_LIST_CHOICES: sorted(
                    choices, key=lambda x: x[ATTR_CHOICE_TIMESTAMP]
                ),
            }
        )

    return songs_with_aggregate_choices


def deserialize_db_item(item):
    return {k: dynamodb_deserializer.deserialize(v) for k, v in item["Item"].items()}
