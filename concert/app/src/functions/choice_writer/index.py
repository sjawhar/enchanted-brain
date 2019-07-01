import boto3
import json
import os

"""
Processes SNS messages containing user choices by writing choices to Dynamo.
For event and database record shapes, see https://github.com/sjawhar/enchanted-brain/issues/4.
"""

EVENT_USER_ID_KEY = "userId"
EVENT_CHOICE_TYPE_KEY = "choiceType"
EVENT_CHOICE_KEY = "choice"
EVENT_TIMESTAMP_KEY = "timestamp"

CHOICE_COLOR = "CHOICE_COLOR"
CHOICE_EMOTION = "CHOICE_EMOTION"
CHOICE_CHILLS = "CHOICE_CHILLS"
CHOICE_IMAGERY = "CHOICE_IMAGERY"

CONCERT_SONG_ID = os.environ["EVENT_NAME"]
DYNAMODB_TABLE_NAME = os.environ["DYNAMODB_TABLE_NAME"]

choice_type_to_choice_key = {
    CHOICE_COLOR: "colors",
    CHOICE_EMOTION: "emotions",
    CHOICE_CHILLS: "chills",
    CHOICE_IMAGERY: "imagery",
}

dynamodb_args = {}
if os.environ.get("DYNAMODB_ENDPOINT") is not None:
    dynamodb_args["endpoint_url"] = os.environ["DYNAMODB_ENDPOINT"]
if os.environ.get("DYNAMODB_REGION") is not None:
    dynamodb_args["region_name"] = os.environ["DYNAMODB_REGION"]

dynamodb = boto3.resource("dynamodb", **dynamodb_args)
table = dynamodb.Table(DYNAMODB_TABLE_NAME)


def handler(event, context):
    update_args = get_update_args(event)
    table.update_item(**update_args)
    return {"statusCode": 204}


def get_update_args(event):
    choice_data = json.loads(event["Records"][0]["Sns"]["Message"])
    listen_id = choice_data[EVENT_USER_ID_KEY]
    choice_type = choice_data[EVENT_CHOICE_TYPE_KEY]
    choice = choice_data[EVENT_CHOICE_KEY]
    timestamp = choice_data[EVENT_TIMESTAMP_KEY]

    # If choice type is not recognized, raise exception to indicate failure to SNS
    if choice_type not in choice_type_to_choice_key:
        raise ValueError

    update_args = {
        "Key": {"songId": CONCERT_SONG_ID, "listenId": listen_id},
        "ExpressionAttributeValues": {":choice_value": choice},
        "ReturnValues": "NONE",
    }

    choice_key = choice_type_to_choice_key[choice_type]
    if choice_type == CHOICE_IMAGERY:
        update_args["UpdateExpression"] = "SET #choice_key = :choice_value"
        update_args["ExpressionAttributeNames"] = {"#choice_key": choice_key}
    else:
        update_args["UpdateExpression"] = "SET #choice_key.#timestamp = :choice_value"
        update_args["ExpressionAttributeNames"] = {
            "#choice_key": choice_key,
            "#timestamp": timestamp,
        }
    return update_args
