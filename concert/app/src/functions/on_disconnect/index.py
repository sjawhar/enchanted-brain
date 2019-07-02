import os


CALLBACK_FUNCTION_ARN = os.environ.get("CALLBACK_FUNCTION_ARN")
CALLBACK_SNS_TOPIC_ARN = os.environ.get("CALLBACK_SNS_TOPIC_ARN")
CALLBACK_SQS_QUEUE_ARN_PREFIX = os.environ.get("CALLBACK_SQS_QUEUE_ARN_PREFIX")

client_lambda = boto3.client("lambda")
client_sns = boto3.client("sns")
client_sqs = boto3.client("sqs")


def handler(event, context):
    connection_id = event["requestContext"]["connectionId"]

    client_sqs.delete_queue(
        QueueUrl="https://sqs.us-east-1.amazonaws.com/387343799327/development-enchanted-brain-callback-{}".format(
            connection_id[:-1]
        )
    )

    return {"statusCode": 204}
