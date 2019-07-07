import boto3
import json
import os

SNS_CALLBACK_ARN = os.environ["CALLBACK_SNS_TOPIC_ARN"]

sns = boto3.client("sns")


def handler(event, context):
    print(event)
    print(os.environ)
    message = json.loads(event["body"])

    response = sns.publish(
        TopicArn=SNS_CALLBACK_ARN,
        Message=json.dumps(message),
        MessageStructure="string",
        MessageAttributes={
            "connection_type": {"DataType": "String", "StringValue": "GLOBAL"}
        },
    )
    return {"statusCode": 204}
