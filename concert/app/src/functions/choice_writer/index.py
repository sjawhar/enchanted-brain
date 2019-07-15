import boto3
import json
import os
from enchanted_brain.attributes import (
    ATTR_CHOICE_TIMESTAMP,
    ATTR_CHOICE_TYPE,
    ATTR_CHOICE_VALUE_COLOR,
    ATTR_CHOICE_VALUE_EMOTION,
    ATTR_CHOICE_VALUE_EMOTION_TYPE,
    ATTR_CHOICE_VALUE_CHILLS,
    ATTR_RECORD_ID,
    ATTR_RECORD_TYPE,
    CHOICE_CHILLS,
    CHOICE_COLOR,
    CHOICE_EMOTION_AGITATION,
    CHOICE_EMOTION_HAPPINESS,
    RECORD_TYPE_CHOICE,
)

"""
Processes SNS messages containing user choices by writing choices to Dynamo.
For event and database record shapes, see https://github.com/sjawhar/enchanted-brain/issues/4.
"""

DYNAMODB_TABLE_NAME = os.environ.get("DYNAMODB_TABLE_NAME")
DYNAMODB_ENDPOINT = os.environ.get("DYNAMODB_ENDPOINT")
DYNAMODB_REGION = os.environ.get("DYNAMODB_REGION")

dynamodb_args = {}
if DYNAMODB_ENDPOINT:
    dynamodb_args["endpoint_url"] = DYNAMODB_ENDPOINT
if DYNAMODB_REGION:
    dynamodb_args["region_name"] = DYNAMODB_REGION
dynamodb = boto3.resource("dynamodb", **dynamodb_args)
table = dynamodb.Table(DYNAMODB_TABLE_NAME)

CHOICE_TYPE_KEYS = {
    CHOICE_COLOR: ATTR_CHOICE_VALUE_COLOR,
    CHOICE_EMOTION_AGITATION: ATTR_CHOICE_VALUE_EMOTION,
    CHOICE_EMOTION_HAPPINESS: ATTR_CHOICE_VALUE_EMOTION,
    CHOICE_CHILLS: ATTR_CHOICE_VALUE_CHILLS,
}


def handler(event, context):
    update_args = get_update_args(event)
    table.update_item(**update_args)
    return {"statusCode": 204}


def get_update_args(event):
    choice_data = json.loads(event["Records"][0]["Sns"]["Message"])
    record_id = choice_data["userId"]
    choice_type = choice_data["choiceType"]
    choice = choice_data["choice"]
    timestamp = choice_data["timestamp"]

    # If choice type is not recognized, raise exception to indicate failure to SNS
    if choice_type not in CHOICE_TYPE_KEYS:
        raise ValueError

    choice_key = CHOICE_TYPE_KEYS[choice_type]
    update_args = {
        "Key": {ATTR_RECORD_TYPE: RECORD_TYPE_CHOICE, ATTR_RECORD_ID: record_id},
        "UpdateExpression": "SET #choice_key.#timestamp = :choice_value",
        "ExpressionAttributeNames": {
            "#choice_key": choice_key,
            "#timestamp": timestamp,
        },
        "ExpressionAttributeValues": {":choice_value": choice},
        "ReturnValues": "NONE",
    }

    if choice_type in [CHOICE_EMOTION_AGITATION, CHOICE_EMOTION_HAPPINESS]:
        emotion_type = choice_type.split("_")[-1]
        update_args["UpdateExpression"] += ", #emotion_type = :emotion_type"
        update_args["ExpressionAttributeNames"][
            "#emotion_type"
        ] = ATTR_CHOICE_VALUE_EMOTION_TYPE
        update_args["ExpressionAttributeValues"][":emotion_type"] = emotion_type

    return update_args
