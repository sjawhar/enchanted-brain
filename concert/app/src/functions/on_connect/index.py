import boto3
import os


CALLBACK_FUNCTION_ARN = os.environ.get("CALLBACK_FUNCTION_ARN")
CALLBACK_SNS_TOPIC_ARN = os.environ.get("CALLBACK_SNS_TOPIC_ARN")
CALLBACK_SQS_QUEUE_ARN_PREFIX = os.environ.get("CALLBACK_SQS_QUEUE_ARN_PREFIX")

client_lambda = boto3.client("lambda")
client_sns = boto3.client("sns")
client_sqs = boto3.client("sqs")


def handler(event, context):
    connection_id = event["requestContext"]["connectionId"]
    queue_arn = "{}-{}".format(CALLBACK_SQS_QUEUE_ARN_PREFIX, connection_id[:-1])

    # TODO: Store queue URL, event source mapping UUID, and subscription arn
    client_sqs.create_queue(QueueName=queue_arn.split(":")[-1])
    client_lambda.create_event_source_mapping(
        EventSourceArn=queue_arn,
        FunctionName=CALLBACK_FUNCTION_ARN,
        Enabled=True,
        BatchSize=1,
    )
    client_sns.subscribe(
        TopicArn=CALLBACK_SNS_TOPIC_ARN,
        Protocol="sqs",
        Endpoint=queue_arn,
        Attributes={"RawMessageDelivery": "true"},
        ReturnSubscriptionArn=True,
    )
    return {"statusCode": 204}
