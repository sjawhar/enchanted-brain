import boto3
import json
import os

CALLBACK_GLOBAL_SNS_TOPIC_ARN = os.environ["CALLBACK_GLOBAL_SNS_TOPIC_ARN"]

sns = boto3.client("sns")


def handler(event, context):
    message = json.loads(event["body"])

    response = sns.publish(
        TopicArn=CALLBACK_GLOBAL_SNS_TOPIC_ARN,
        Message=json.dumps(message),
        MessageStructure="string",
        MessageAttributes={
            "connection_type": {"DataType": "String", "StringValue": "GLOBAL"}
        },
    )

    return {"statusCode": 204}
