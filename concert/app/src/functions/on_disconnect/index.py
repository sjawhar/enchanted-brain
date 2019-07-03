import boto3
import os
from enchanted_brain.attributes import (
    ATTR_CONNECTION_STACK_NAME,
    ATTR_RECORD_ID,
    ATTR_RECORD_TYPE,
    RECORD_TYPE_CONNECTION,
)


DYNAMODB_TABLE_NAME = os.environ.get("DYNAMODB_TABLE_NAME")

cloudformation = boto3.client("cloudformation")

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table(DYNAMODB_TABLE_NAME)


def handler(event, context):
    connection_key = {
        ATTR_RECORD_TYPE: RECORD_TYPE_CONNECTION,
        ATTR_RECORD_ID: event["requestContext"]["connectionId"],
    }

    stack_name = table.get_item(Key=connection_key)["Item"][ATTR_CONNECTION_STACK_NAME]
    cloudformation.delete_stack(StackName=stack_name)
    table.delete_item(Key=connection_key)

    return {"statusCode": 204}
