import boto3
import os
import time
from enchanted_brain.attributes import (
    ATTR_CONNECTION_LAMBDA_MAPPING_UUID,
    ATTR_CONNECTION_SNS_SUBSCRIPTION_ARNS,
    ATTR_CONNECTION_SQS_QUEUE_URL,
    ATTR_RECORD_ID,
    RECORD_ID_PREFIX_CONNECTION,
)


DYNAMODB_TABLE_NAME = os.environ.get("DYNAMODB_TABLE_NAME")

client_lambda = boto3.client("lambda")
client_sns = boto3.client("sns")
client_sqs = boto3.client("sqs")

table = boto3.resource("dynamodb").Table(DYNAMODB_TABLE_NAME)


def handler(event, context):
    connection_key = {
        ATTR_RECORD_ID: "{}${}".format(
            RECORD_ID_PREFIX_CONNECTION, event["requestContext"]["connectionId"]
        )
    }

    resources = table.get_item(Key=connection_key)["Item"]

    for subscription_arn in sorted(resources[ATTR_CONNECTION_SNS_SUBSCRIPTION_ARNS]):
        client_sns.unsubscribe(SubscriptionArn=subscription_arn)
    client_sqs.delete_queue(QueueUrl=resources[ATTR_CONNECTION_SQS_QUEUE_URL])

    for i in range(5):
        try:
            client_lambda.delete_event_source_mapping(
                UUID=resources[ATTR_CONNECTION_LAMBDA_MAPPING_UUID]
            )
            break
        except Exception as e:
            print(e)
            time.sleep(2 ** i)

    table.delete_item(Key=connection_key)

    return {"statusCode": 204}
