import boto3
import json
import os
from botocore.vendored import requests
from enchanted_brain.attributes import (
    ATTR_CHOICE_VALUE_EMOTION,
    ATTR_CHOICE_VALUE_CHILLS,
    ATTR_CHOICE_VALUE_COLOR,
    ATTR_RECORD_ID,
    RECORD_ID_AGGREGATE,
)

DYNAMODB_TABLE_NAME = os.environ.get("DYNAMODB_TABLE_NAME")
DYNAMODB_ENDPOINT = os.environ.get("DYNAMODB_ENDPOINT")
KINESIS_ANALYTICS_APPLICATION_NAME = os.environ.get(
    "KINESIS_ANALYTICS_APPLICATION_NAME"
)

dynamodb_args = {}
if DYNAMODB_ENDPOINT:
    dynamodb_args["endpoint_url"] = DYNAMODB_ENDPOINT
dynamodb = boto3.resource("dynamodb", **dynamodb_args)
table = dynamodb.Table(DYNAMODB_TABLE_NAME)

kinesis_analytics = boto3.client("kinesisanalyticsv2")


def handler(event, context):
    status = "FAILED"
    try:
        prepare_aggregate_choices_record()
        start_kinesis_analytics_application()
        status = "SUCCESS"
    except kinesis_analytics.exceptions.ResourceInUseException:
        print("Kinesis application already running. Nothing to see here...")
        status = "SUCCESS"
    finally:
        put_response(event, context, status)
    return {"statusCode": 204}


def prepare_aggregate_choices_record():
    return table.update_item(
        Key={ATTR_RECORD_ID: RECORD_ID_AGGREGATE},
        UpdateExpression="SET #chills_map = if_not_exists(#chills_map, :empty_map), #colors_map = if_not_exists(#colors_map, :empty_map), #emotions_map = if_not_exists(#emotions_map, :empty_map)",
        ExpressionAttributeNames={
            "#chills_map": ATTR_CHOICE_VALUE_CHILLS,
            "#colors_map": ATTR_CHOICE_VALUE_COLOR,
            "#emotions_map": ATTR_CHOICE_VALUE_EMOTION,
        },
        ExpressionAttributeValues={":empty_map": {}},
        ReturnValues="NONE",
    )


def start_kinesis_analytics_application():
    return kinesis_analytics.start_application(
        ApplicationName=KINESIS_ANALYTICS_APPLICATION_NAME,
        RunConfiguration={
            "SqlRunConfigurations": [
                {
                    "InputId": "1.1",
                    "InputStartingPositionConfiguration": {
                        "InputStartingPosition": "NOW"
                    },
                }
            ]
        },
    )


# taken from https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/cfn-lambda-function-code-cfnresponsemodule.html
def put_response(event, context, status):
    response_url = event["ResponseURL"]

    response_body = {
        "Status": status,
        "Reason": "See the details in CloudWatch Log Stream: "
        + context.log_stream_name,
        "StackId": event["StackId"],
        "RequestId": event["RequestId"],
        "LogicalResourceId": event["LogicalResourceId"],
        "PhysicalResourceId": event["LogicalResourceId"],
    }

    json_response_body = json.dumps(response_body)

    headers = {"content-type": "", "content-length": str(len(json_response_body))}

    try:
        response = requests.put(response_url, data=json_response_body, headers=headers)
        print("Status code: " + response.reason)
    except Exception as e:
        print("send(..) failed executing requests.put(..): " + str(e))
