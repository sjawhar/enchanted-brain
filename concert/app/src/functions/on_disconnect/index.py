import boto3
import os


client_sqs = boto3.client("sqs")


def handler(event, context):
    connection_id = event["requestContext"]["connectionId"]

    # TODO: Read queue URL, event source mapping UUID, and subscription ARN
    client_sqs.delete_queue(
        QueueUrl="https://sqs.us-east-1.amazonaws.com/387343799327/development-enchanted-brain-callback-{}".format(
            connection_id[:-1]
        )
    )

    return {"statusCode": 204}
