import boto3
import os
import json
from enchanted_brain.attributes import (
    ATTR_CONNECTION_LAMBDA_MAPPING_UUID,
    ATTR_CONNECTION_SNS_SUBSCRIPTION_ARN,
    ATTR_CONNECTION_SQS_QUEUE_URL,
    ATTR_RECORD_ID,
    ATTR_RECORD_TYPE,
    RECORD_TYPE_CONNECTION,
)


CALLBACK_FUNCTION_ARN = os.environ.get("CALLBACK_FUNCTION_ARN")
CALLBACK_SNS_TOPIC_ARN = os.environ.get("CALLBACK_SNS_TOPIC_ARN")
CALLBACK_SQS_QUEUE_ARN_PREFIX = os.environ.get("CALLBACK_SQS_QUEUE_ARN_PREFIX")
DYNAMODB_TABLE_NAME = os.environ.get("DYNAMODB_TABLE_NAME")

client_lambda = boto3.client("lambda")
client_sns = boto3.client("sns")
client_sqs = boto3.client("sqs")

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table(DYNAMODB_TABLE_NAME)


def handler(event, context):
    connection_id = event["requestContext"]["connectionId"]
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
                            "Condition": {
                                "ArnEquals": {"aws:SourceArn": CALLBACK_SNS_TOPIC_ARN}
                            },
                        }
                    ],
                }
            )
        },
    )["QueueUrl"]
    mapping_uuid = client_lambda.create_event_source_mapping(
        EventSourceArn=queue_arn,
        FunctionName=CALLBACK_FUNCTION_ARN,
        Enabled=True,
        BatchSize=1,
    )["UUID"]
    subscription_arn = client_sns.subscribe(
        TopicArn=CALLBACK_SNS_TOPIC_ARN,
        Protocol="sqs",
        Endpoint=queue_arn,
        Attributes={"RawMessageDelivery": "true"},
        ReturnSubscriptionArn=True,
    )["SubscriptionArn"]

    table.put_item(
        Item={
            ATTR_RECORD_TYPE: RECORD_TYPE_CONNECTION,
            ATTR_RECORD_ID: connection_id,
            ATTR_CONNECTION_LAMBDA_MAPPING_UUID: mapping_uuid,
            ATTR_CONNECTION_SNS_SUBSCRIPTION_ARN: subscription_arn,
            ATTR_CONNECTION_SQS_QUEUE_URL: queue_url,
        }
    )

    return {"statusCode": 204}
