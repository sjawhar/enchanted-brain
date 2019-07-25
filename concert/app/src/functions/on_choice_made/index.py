import boto3
import json
import os

"""
Processes websocket API messages from API Gateway
"""

AGGREGATE_CHOICE_DELIVERY_STREAM_NAME = os.environ[
    "AGGREGATE_CHOICE_DELIVERY_STREAM_NAME"
]
CHOICE_MADE_SNS_TOPIC_ARN = os.environ["CHOICE_MADE_SNS_TOPIC_ARN"]

sns = boto3.client("sns")
firehose = boto3.client("firehose")


def handler(event, context):

    message = json.loads(event["body"])["data"]
    message["userId"] = event["requestContext"]["authorizer"]["principalId"]

    response = sns.publish(
        TopicArn=CHOICE_MADE_SNS_TOPIC_ARN,
        Message=json.dumps(message),
        MessageStructure="string",
    )
    firehose_response = firehose.put_record(
        DeliveryStreamName=AGGREGATE_CHOICE_DELIVERY_STREAM_NAME,
        Record={"Data": json.dumps(message)},
    )

    return {"statusCode": 204}
