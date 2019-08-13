import boto3
import json
import os
from enchanted_brain.attributes import ATTR_RECORD_ID, ATTR_STAGE_ID, RECORD_ID_EVENT_STAGE

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

    sns_response = sns.publish(
        TopicArn=CALLBACK_GLOBAL_SNS_TOPIC_ARN,
        Message=json.dumps(message),
        MessageStructure="string",
        MessageAttributes={
            "connection_type": {"DataType": "String", "StringValue": "GLOBAL"}
        },
    )

    stage_record_update_response = update_stage_record(message)

    return {"statusCode": 204}


def update_stage_record(message):
    data = message["data"]
    stage_id = data.pop(ATTR_STAGE_ID)

    update_args = {
        "Key": {ATTR_RECORD_ID: RECORD_ID_EVENT_STAGE},
        "UpdateExpression": "SET #stage_id = :stage_id",
        "ExpressionAttributeNames": {"#stage_id": ATTR_STAGE_ID},
        "ExpressionAttributeValues": {":stage_id": stage_id},
        "ReturnValues": "NONE",
    }

    for key, value in data.items():
        update_args["UpdateExpression"] += ", #{} = :{}".format(key, key)
        update_args["ExpressionAttributeNames"]["#{}".format(key)] = key
        update_args["ExpressionAttributeValues"][":{}".format(key)] = value

    return table.update_item(**update_args)
