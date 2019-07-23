import boto3
import json
import os

"""
Processes websocket API messages from API Gateway
"""

CHOICE_MADE_SNS_TOPIC_ARN = os.environ["CHOICE_MADE_SNS_TOPIC_ARN"]

sns = boto3.client("sns")


def handler(event, context):

    message = json.loads(event["body"])["data"]
    message["userId"] = event["requestContext"]["authorizer"]["principalId"]

    response = sns.publish(
        TopicArn=CHOICE_MADE_SNS_TOPIC_ARN,
        Message=json.dumps(message),
        MessageStructure="string",
    )

    return {"statusCode": 204}
