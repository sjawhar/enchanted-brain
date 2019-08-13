import boto3
import json
import os
from base64 import b64decode
from botocore.exceptions import ClientError
from decimal import *
from enchanted_brain.attributes import (
    ATTR_TOTAL_CHOICES,
    ATTR_CHOICE_VALUE_COLOR,
    ATTR_CHOICE_VALUE_EMOTION,
    ATTR_CHOICE_VALUE_CHILLS,
    ATTR_RECORD_ID,
    CHOICE_CHILLS,
    CHOICE_COLOR,
    CHOICE_EMOTION_ENERGY,
    CHOICE_EMOTION_HAPPINESS,
    RECORD_ID_AGGREGATE,
)

DYNAMODB_TABLE_NAME = os.environ.get("DYNAMODB_TABLE_NAME")
DYNAMODB_ENDPOINT = os.environ.get("DYNAMODB_ENDPOINT")

dynamodb_args = {}
if DYNAMODB_ENDPOINT:
    dynamodb_args["endpoint_url"] = DYNAMODB_ENDPOINT
dynamodb = boto3.resource("dynamodb", **dynamodb_args)
table = dynamodb.Table(DYNAMODB_TABLE_NAME)

CHOICE_TYPE_KEYS = {
    CHOICE_COLOR: ATTR_CHOICE_VALUE_COLOR,
    CHOICE_EMOTION_ENERGY: ATTR_CHOICE_VALUE_EMOTION,
    CHOICE_EMOTION_HAPPINESS: ATTR_CHOICE_VALUE_EMOTION,
    CHOICE_CHILLS: ATTR_CHOICE_VALUE_CHILLS,
}


def handler(event, context):
    firehose_response = {"records": []}
    records = event["records"]
    for record in records:
        record_id = record["recordId"]
        record_response = {"recordId": record_id}
        try:
            put_response = add_record_to_aggregate(record)
            record_response["result"] = "Ok"
        except:
            record_response["result"] = "DeliveryFailed"
        firehose_response["records"].append(record_response)
    return firehose_response


def create_map_for_record_if_none_exists(timestamp, choice_key):
    update_args = {
        "Key": {ATTR_RECORD_ID: RECORD_ID_AGGREGATE},
        "UpdateExpression": "SET #choice_key.#timestamp = :empty_map",
        "ExpressionAttributeNames": {
            "#choice_key": choice_key,
            "#timestamp": timestamp,
        },
        "ExpressionAttributeValues": {":empty_map": {}},
        "ConditionExpression": "attribute_not_exists(#choice_key.#timestamp)",
        "ReturnValues": "NONE",
    }
    try:
        return table.update_item(**update_args)
    except ClientError as e:
        if e.response["Error"]["Code"] != "ConditionalCheckFailedException":
            raise


def add_record_to_aggregate(record):
    data = json.loads(b64decode(record["data"]).decode("utf-8"))
    timestamp = data["CHOICE_TIME"]
    choice_type = data["CHOICE_TYPE"]
    choice_sum = Decimal(data["CHOICE_SUM"])
    choice_count = data["CHOICE_COUNT"]

    update_args = {
        "Key": {ATTR_RECORD_ID: RECORD_ID_AGGREGATE},
        "UpdateExpression": "ADD #choice_key.#timestamp.#choice_string :choice_sum, #choice_key.#timestamp.#total_choices :choice_count",
        "ExpressionAttributeNames": {
            "#timestamp": timestamp,
            "#total_choices": ATTR_TOTAL_CHOICES,
        },
        "ExpressionAttributeValues": {
            ":choice_sum": choice_sum,
            ":choice_count": choice_count,
        },
        "ReturnValues": "NONE",
    }

    if choice_type.startswith(CHOICE_COLOR):
        color = choice_type.split("_")[2]
        choice_type = CHOICE_COLOR
        update_args["ExpressionAttributeNames"]["#choice_string"] = color

    elif choice_type.startswith("CHOICE_EMOTION"):
        emotion = choice_type[7:]
        update_args["ExpressionAttributeNames"]["#choice_string"] = emotion
        update_args["ExpressionAttributeNames"]["#total_choices"] += "_{}".format(
            emotion
        )

    else:
        update_args["ExpressionAttributeNames"][
            "#choice_string"
        ] = ATTR_CHOICE_VALUE_CHILLS

    choice_key = CHOICE_TYPE_KEYS[choice_type]
    update_args["ExpressionAttributeNames"]["#choice_key"] = choice_key

    ensure_map_available_for_record = create_map_for_record_if_none_exists(
        timestamp, choice_key
    )

    return table.update_item(**update_args)
