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
TABLE_NAME = os.environ.get("TABLE_NAME")

cloudformation = boto3.client("cloudformation")
dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table(TABLE_NAME)

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
    queue_name = connection_id[:-1]
    stack_name = [CLOUDFORMATION_STACK_NAME_PREFIX, queue_name].join("-")
    stack_id = cloudformation.create_stack(
        StackName=stack_name,
        TemplateBody=CLOUDFORMATION_STACK_TEMPLATE_BODY,
        Parameters=[
            {"ParameterKey": "Environment", "ParameterValue": APP_ENVIRONMENT},
            {"ParameterKey": "SqsQueueName", "ParameterValue": queue_name},
        ],
        Tags=CLOUDFORMATION_STACK_TAGS,
    )["StackId"]

    table.put_item(
        Item={
            ATTR_RECORD_TYPE: RECORD_TYPE_CONNECTION,
            ATTR_RECORD_ID: connection_id,
            ATTR_CONNECTION_STACK_NAME: stack_name,
        }
    )
    return {"statusCode": 204}
