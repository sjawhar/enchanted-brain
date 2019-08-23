import boto3
import json
import os
import decimal
from boto3.dynamodb import types
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
    RECORD_ID_AGGREGATE,
    RECORD_ID_EVENT_STAGE,
    RECORD_ID_SONG_LIST,
    STAGE_END,
)

CALLBACK_GLOBAL_SNS_TOPIC_ARN = os.environ["CALLBACK_GLOBAL_SNS_TOPIC_ARN"]
DYNAMODB_TABLE_NAME = os.environ.get("DYNAMODB_TABLE_NAME")

sns = boto3.client("sns")
dynamodb = boto3.client("dynamodb")


def handler(event, context):
    message = json.loads(event["body"])

    if message["data"][ATTR_EVENT_STAGE_ID] == STAGE_END:
        song_list, aggregate_data = get_song_list_and_aggregate_data()
        songs_with_choices = get_songs_with_aggregate_choices(song_list, aggregate_data)
        message["data"][ATTR_SONG_LIST_SONGS] = songs_with_choices

    update_event_stage_and_song_list(message)

    sns.publish(
        TopicArn=CALLBACK_GLOBAL_SNS_TOPIC_ARN,
        Message=json.dumps(message, default=decimal_default),
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


def get_song_list_get_transaction_item():
    serializer = boto3.dynamodb.types.TypeSerializer()
    song_list_get_args = {
        "Key": {ATTR_RECORD_ID: serializer.serialize(RECORD_ID_SONG_LIST)},
        "TableName": DYNAMODB_TABLE_NAME,
    }

    return {"Get": song_list_get_args}


def get_aggregate_data_get_transaction_item():
    serializer = boto3.dynamodb.types.TypeSerializer()
    aggregate_data_get_args = {
        "Key": {ATTR_RECORD_ID: serializer.serialize(RECORD_ID_AGGREGATE)},
        "TableName": DYNAMODB_TABLE_NAME,
    }

    return {"Get": aggregate_data_get_args}


def get_song_list_and_aggregate_data():
    song_list_get_transaction_item = get_song_list_get_transaction_item()
    aggregate_data_get_transaction_item = get_aggregate_data_get_transaction_item()

    transaction_items = [
        song_list_get_transaction_item,
        aggregate_data_get_transaction_item,
    ]

    responses = dynamodb.transact_get_items(TransactItems=transaction_items)[
        "Responses"
    ]

    deserializer = boto3.dynamodb.types.TypeDeserializer()
    songs = {k: deserializer.deserialize(v) for k, v in responses[0]["Item"].items()}
    aggregate_data = {
        k: deserializer.deserialize(v) for k, v in responses[1]["Item"].items()
    }

    return songs, aggregate_data


def get_songs_with_aggregate_choices(song_list, aggregate_data):
    songs = []
    for song_metadata in song_list[ATTR_SONG_LIST_SONGS]:
        display_name = song_metadata[ATTR_SONG_LIST_DISPLAY_NAME]
        start_time = song_metadata[ATTR_SONG_LIST_START_TIME]
        end_time = song_metadata[ATTR_SONG_LIST_END_TIME]

        choice_type = None

        for timestamp in aggregate_data[ATTR_CHOICE_VALUE_COLOR].keys():
            if start_time <= timestamp < end_time:
                choice_type = ATTR_CHOICE_VALUE_COLOR
                break
        if not choice_type:
            choice_type = ATTR_CHOICE_VALUE_CHILLS

        choices = []
        for timestamp, aggregate_choice_data in aggregate_data[choice_type].items():
            if start_time <= timestamp < end_time:
                choices_at_timestamp = {ATTR_CHOICE_TIMESTAMP: timestamp}
                if choice_type == ATTR_CHOICE_VALUE_COLOR:
                    choices_at_timestamp.update(
                        {
                            k[4:]: v
                            for k, v in aggregate_choice_data.items()
                            if str.startswith(k, ATTR_AGGREGATE_CHOICE_SUM)
                        }
                    )
                else:
                    choices_at_timestamp.update(
                        {
                            ATTR_AGGREGATE_CHOICE_SUM: aggregate_choice_data[
                                ATTR_AGGREGATE_CHOICE_SUM
                            ],
                            ATTR_AGGREGATE_CHOICE_COUNT: aggregate_choice_data[
                                ATTR_AGGREGATE_CHOICE_COUNT
                            ],
                        }
                    )
                choices.append(choices_at_timestamp)

        songs.append(
            {
                ATTR_SONG_LIST_DISPLAY_NAME: display_name,
                ATTR_SONG_LIST_START_TIME: start_time,
                ATTR_SONG_LIST_END_TIME: end_time,
                ATTR_CHOICE_TYPE: choice_type,
                ATTR_SONG_LIST_CHOICES: choices,
            }
        )

    return songs


def decimal_default(obj):
    if isinstance(obj, decimal.Decimal):
        if obj % 1 > 0:
            return float(obj)
        return int(obj)
    raise TypeError
