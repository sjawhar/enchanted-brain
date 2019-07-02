import boto3
import json
import os

# from enchanted_brain.attributes import ATTR_USER_ID

"""
Processes websocket API messages from API Gateway
"""

# SNS_CHOICE_MADE_ARN = os.environ["CHOICE_MADE_SNS_TOPIC_ARN"]

sns = boto3.client("sns")


def handler(event, context):
    # print(ATTR_USER_ID)
    print(event)
    print(os.environ)

    # data = event["data"]
    # print(data)
    # response = sns.publish(
    #     TopicArn=SNS_CHOICE_MADE_ARN,
    #     Message=json.dumps(data),
    #     MessageStructure="string",
    # )

    return {"statusCode": 200,
            "body": json.dumps(event)}
