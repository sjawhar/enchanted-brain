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
    ATTR_CHOICE_VALUE_IMAGERY,
    ATTR_RECORD_ID,
    ATTR_RECORD_TYPE,
    CHOICE_CHILLS,
    CHOICE_COLOR,
    CHOICE_EMOTION_AGITATION,
    CHOICE_EMOTION_HAPPINESS,
    CHOICE_IMAGERY,
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

choice_type_to_choice_key = {
    CHOICE_COLOR: ATTR_CHOICE_VALUE_COLOR,
    CHOICE_EMOTION_AGITATION: ATTR_CHOICE_VALUE_EMOTION,
    CHOICE_EMOTION_HAPPINESS: ATTR_CHOICE_VALUE_EMOTION,
    CHOICE_CHILLS: ATTR_CHOICE_VALUE_CHILLS,
    CHOICE_IMAGERY: ATTR_CHOICE_VALUE_IMAGERY,
}


def handler(event, context):
    print(event)
    update_args = get_update_args(event)
    table.update_item(**update_args)
    return {"statusCode": 204}


def get_update_args(event):
    choice_data = json.loads(event["Records"][0]["Sns"]["Message"])["data"]
    record_id = "userId"
    choice_type = choice_data["choiceType"]
    choice = choice_data["choice"]
    timestamp = choice_data["timestamp"]

    # If choice type is not recognized, raise exception to indicate failure to SNS
    if choice_type not in choice_type_to_choice_key:
        raise ValueError

    choice_key = choice_type_to_choice_key[choice_type]
    update_args = {
        "Key": {ATTR_RECORD_TYPE: RECORD_TYPE_CHOICE, ATTR_RECORD_ID: record_id},
        "UpdateExpression": "SET #choice_key = :choice_value",
        "ExpressionAttributeNames": {"#choice_key": choice_key},
        "ExpressionAttributeValues": {":choice_value": choice},
        "ReturnValues": "NONE",
    }

    if choice_type != CHOICE_IMAGERY:
        update_args["UpdateExpression"] = "SET #choice_key.#timestamp = :choice_value"
        update_args["ExpressionAttributeNames"]["#timestamp"] = timestamp
    if (
        choice_type == CHOICE_EMOTION_AGITATION
        or choice_type == CHOICE_EMOTION_HAPPINESS
    ):
        emotion_type = choice_type.split("_")[-1]
        update_args["UpdateExpression"] += ", #emotionType = :emotionType"
        update_args["ExpressionAttributeNames"][
            "#emotionType"
        ] = ATTR_CHOICE_VALUE_EMOTION_TYPE
        update_args["ExpressionAttributeVales"][":emotionType"] = emotion_type
    print(update_args)
    return update_args
