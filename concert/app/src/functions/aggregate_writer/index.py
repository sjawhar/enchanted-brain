import boto3
import json
import os
from base64 import b64decode
from botocore.exceptions import ClientError
from decimal import *
from enchanted_brain.attributes import (
    ATTR_AGGREGATE_CHOICE_COUNT,
    ATTR_AGGREGATE_CHOICE_SUM,
    ATTR_CHOICE_VALUE_CHILLS,
    ATTR_CHOICE_VALUE_COLOR,
    ATTR_CHOICE_VALUE_EMOTION,
    ATTR_RECORD_ID,
    CHOICE_CHILLS,
    CHOICE_COLOR,
    CHOICE_EMOTION_ANGER,
    CHOICE_EMOTION_HAPPINESS,
    PREFIX_CHOICE_TYPE_EMOTION,
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
    CHOICE_EMOTION_ANGER: ATTR_CHOICE_VALUE_EMOTION,
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


def update_aggregate_record(**update_args):
    return table.update_item(
        Key={ATTR_RECORD_ID: RECORD_ID_AGGREGATE}, ReturnValues="NONE", **update_args
    )


def create_map_for_record_if_none_exists(timestamp, choice_key):
    return update_aggregate_record(
        UpdateExpression="SET #choice_key.#timestamp = if_not_exists(#choice_key.#timestamp, :empty_map)",
        ExpressionAttributeNames={"#choice_key": choice_key, "#timestamp": timestamp},
        ExpressionAttributeValues={":empty_map": {}},
    )


def add_record_to_aggregate(record):
    data = json.loads(b64decode(record["data"]).decode("utf-8"), parse_float=Decimal)
    timestamp = data["CHOICE_TIME"].replace(" ", "T") + "Z"
    choice_type = data["CHOICE_TYPE"]
    choice_sum = data["CHOICE_SUM"]
    choice_count = data["CHOICE_COUNT"]

    update_args = {
        "UpdateExpression": "ADD #choice_key.#timestamp.#choice_sum :choice_sum, #choice_key.#timestamp.#choice_count :choice_count",
        "ExpressionAttributeNames": {
            "#timestamp": timestamp,
            "#choice_count": ATTR_AGGREGATE_CHOICE_COUNT,
            "#choice_sum": ATTR_AGGREGATE_CHOICE_SUM,
        },
        "ExpressionAttributeValues": {
            ":choice_sum": choice_sum,
            ":choice_count": choice_count,
        },
    }

    if choice_type.startswith(CHOICE_COLOR):
        color = choice_type.split("_")[2]
        choice_type = CHOICE_COLOR
        update_args["ExpressionAttributeNames"]["#choice_sum"] += "_{}".format(color)

    elif choice_type.startswith(PREFIX_CHOICE_TYPE_EMOTION):
        emotion = choice_type[7:]
        update_args["ExpressionAttributeNames"]["#choice_sum"] += "_{}".format(emotion)
        update_args["ExpressionAttributeNames"]["#choice_count"] += "_{}".format(
            emotion
        )

    choice_key = CHOICE_TYPE_KEYS[choice_type]
    update_args["ExpressionAttributeNames"]["#choice_key"] = choice_key

    ensure_map_available_for_record = create_map_for_record_if_none_exists(
        timestamp, choice_key
    )

    return update_aggregate_record(**update_args)
