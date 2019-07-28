import boto3
import os
import json
from boto3.dynamodb.conditions import Attr
from botocore.exceptions import ClientError
from datetime import datetime
from enchanted_brain.attributes import (
    ATTR_CHOICE_VALUE_CHILLS,
    ATTR_CHOICE_VALUE_COLOR,
    ATTR_CHOICE_VALUE_EMOTION,
    ATTR_CONNECTION_LAMBDA_MAPPING_UUID,
    ATTR_CONNECTION_SNS_SUBSCRIPTION_ARNS,
    ATTR_CONNECTION_SQS_QUEUE_URL,
    ATTR_CREATED_AT,
    ATTR_RECORD_ID,
    RECORD_ID_PREFIX_CHOICE,
    RECORD_ID_PREFIX_CONNECTION,
    RECORD_ID_EVENT_STAGE,
)
from enchanted_brain.parser import DynamoDbEncoder
from enchanted_brain.stages import STAGE_WAITING


CALLBACK_FUNCTION_ARN = os.environ.get("CALLBACK_FUNCTION_ARN")
CALLBACK_GLOBAL_SNS_TOPIC_ARN = os.environ.get("CALLBACK_GLOBAL_SNS_TOPIC_ARN")
CALLBACK_VISUALIZATION_SNS_TOPIC_ARN = os.environ.get(
    "CALLBACK_VISUALIZATION_SNS_TOPIC_ARN"
)
CALLBACK_SQS_QUEUE_ARN_PREFIX = os.environ.get("CALLBACK_SQS_QUEUE_ARN_PREFIX")
DYNAMODB_TABLE_NAME = os.environ.get("DYNAMODB_TABLE_NAME")

client_lambda = boto3.client("lambda")
client_sns = boto3.client("sns")
client_sqs = boto3.client("sqs")

table = boto3.resource("dynamodb").Table(DYNAMODB_TABLE_NAME)


def sns_subscribe(topic_arn, queue_arn):
    return client_sns.subscribe(
        TopicArn=topic_arn,
        Protocol="sqs",
        Endpoint=queue_arn,
        Attributes={"RawMessageDelivery": "true"},
        ReturnSubscriptionArn=True,
    )["SubscriptionArn"]


def handler(event, context):
    connection_id = event["requestContext"]["connectionId"]
    authorizer_context = event["requestContext"]["authorizer"]

    sns_topics = [CALLBACK_GLOBAL_SNS_TOPIC_ARN]
    if authorizer_context.get("isVisualization"):
        sns_topics.append(CALLBACK_VISUALIZATION_SNS_TOPIC_ARN)

    queue_arn = "-".join([CALLBACK_SQS_QUEUE_ARN_PREFIX, connection_id[:-1]])
    queue_url = client_sqs.create_queue(
        QueueName=queue_arn.split(":")[-1],
        Attributes={
            "Policy": json.dumps(
                {
                    "Version": "2012-10-17",
                    "Statement": [
                        {
                            "Effect": "Allow",
                            "Action": "sqs:SendMessage",
                            "Resource": queue_arn,
                            "Principal": "*",
                            "Condition": {"ArnEquals": {"aws:SourceArn": sns_topics}},
                        }
                    ],
                }
            ),
        },
    )["QueueUrl"]
    mapping_uuid = client_lambda.create_event_source_mapping(
        EventSourceArn=queue_arn,
        FunctionName=CALLBACK_FUNCTION_ARN,
        Enabled=True,
        BatchSize=1,
    )["UUID"]
    subscription_arns = [sns_subscribe(topic, queue_arn) for topic in sns_topics]

    table.put_item(
        Item={
            ATTR_RECORD_ID: "{}${}".format(RECORD_ID_PREFIX_CONNECTION, connection_id),
            ATTR_CREATED_AT: datetime.now().isoformat(),
            ATTR_CONNECTION_LAMBDA_MAPPING_UUID: mapping_uuid,
            ATTR_CONNECTION_SNS_SUBSCRIPTION_ARNS: set(subscription_arns),
            ATTR_CONNECTION_SQS_QUEUE_URL: queue_url,
        }
    )

    user_id = authorizer_context["principalId"]
    try:
        table.put_item(
            Item={
                ATTR_RECORD_ID: "{}${}".format(RECORD_ID_PREFIX_CHOICE, user_id),
                ATTR_CREATED_AT: datetime.now().isoformat(),
                ATTR_CHOICE_VALUE_CHILLS: {},
                ATTR_CHOICE_VALUE_COLOR: {},
                ATTR_CHOICE_VALUE_EMOTION: {},
            },
            ConditionExpression=Attr(ATTR_RECORD_ID).not_exists(),
        )
    except ClientError as e:
        if e.response["Error"]["Code"] != "ConditionalCheckFailedException":
            raise

    response_data = {"stageId": STAGE_WAITING}
    stage_record = table.get_item(Key={ATTR_RECORD_ID: RECORD_ID_EVENT_STAGE}).get(
        "Item"
    )
    if stage_record:
        for key, value in stage_record.items():
            if key == ATTR_RECORD_ID:
                continue
            response_data[key] = value

    for key, value in authorizer_context.items():
        if key == "principalId" or key == "integrationLatency":
            continue
        response_data[key] = value

    client_sqs.send_message(
        QueueUrl=queue_url,
        MessageBody=json.dumps(
            {"event": "CONNECTED", "data": response_data}, cls=DynamoDbEncoder
        ),
    )

    return {"statusCode": 204}
