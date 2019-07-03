import boto3
import os
from enchanted_brain.attributes import (
    ATTR_CONNECTION_STACK_NAME,
    ATTR_RECORD_ID,
    ATTR_RECORD_TYPE,
    RECORD_TYPE_CONNECTION,
)


APP_ENVIRONMENT = os.environ.get("APP_ENVIRONMENT")
CLOUDFORMATION_STACK_NAME_PREFIX = os.environ.get("CLOUDFORMATION_STACK_NAME_PREFIX")
DYNAMODB_TABLE_NAME = os.environ.get("DYNAMODB_TABLE_NAME")

cloudformation = boto3.client("cloudformation")
dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table(DYNAMODB_TABLE_NAME)

CLOUDFORMATION_STACK_TEMPLATE_BODY = ""
CLOUDFORMATION_STACK_TAGS = [
    {"Key": "environment", "Value": APP_ENVIRONMENT},
    {"Key": "system", "Value": "enchanted-brain"},
    {"Key": "component", "Value": "callback"},
]

with open("cloudformation.yml", "r") as file:
    CLOUDFORMATION_STACK_TEMPLATE_BODY = file.read()


def handler(event, context):
    connection_id = event["requestContext"]["connectionId"]
    stack_name = "-".join([CLOUDFORMATION_STACK_NAME_PREFIX, connection_id[:-1]])
    table.put_item(
        Item={
            ATTR_RECORD_TYPE: RECORD_TYPE_CONNECTION,
            ATTR_RECORD_ID: connection_id,
            ATTR_CONNECTION_STACK_NAME: stack_name,
        }
    )
    stack_id = cloudformation.create_stack(
        StackName=stack_name,
        TemplateBody=CLOUDFORMATION_STACK_TEMPLATE_BODY,
        Parameters=[{"ParameterKey": "Environment", "ParameterValue": APP_ENVIRONMENT}],
        Tags=CLOUDFORMATION_STACK_TAGS,
    )["StackId"]

    return {"statusCode": 204}
