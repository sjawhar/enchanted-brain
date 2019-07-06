import boto3
import json
import os

# from enchanted_brain.attributes import ATTR_USER_ID

"""
Processes websocket API messages from API Gateway
"""

SNS_CHOICE_MADE_ARN = os.environ["CHOICE_MADE_SNS_TOPIC_ARN"]

sns = boto3.client("sns")


def handler(event, context):
    # print(ATTR_USER_ID)

    message = event["body"]
    response = sns.publish(
        TopicArn=SNS_CHOICE_MADE_ARN, Message=message, MessageStructure="string"
    )
    return {"body": "this is a response"}
