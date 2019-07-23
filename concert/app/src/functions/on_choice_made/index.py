import boto3
import json
import os

"""
Processes websocket API messages from API Gateway
"""

SNS_CHOICE_MADE_ARN = os.environ["CHOICE_MADE_SNS_TOPIC_ARN"]
AGGREGATE_CHOICE_DELIVERY_STREAM_NAME = os.environ["AGGREGATE_CHOICE_DELIVERY_STREAM_NAME"]

sns = boto3.client("sns")
firehose = boto3.client("firehose")


def handler(event, context):

    message = json.loads(event["body"])["data"]
    message["userId"] = event["requestContext"]["authorizer"]["principalId"]

    sns_response = sns.publish(
        TopicArn=SNS_CHOICE_MADE_ARN,
        Message=json.dumps(message),
        MessageStructure="string",
    )
    firehose_response = firehose.put_record(
        DeliveryStreamName=AGGREGATE_CHOICE_DELIVERY_STREAM_NAME,
        Record={"Data": json.dumps(message)}
    )

    return {"statusCode": 204}
