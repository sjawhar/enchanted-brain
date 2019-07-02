import boto3
import os


TABLE_NAME = os.environ.get("TABLE_NAME")

client_lambda = boto3.client("lambda")
client_sns = boto3.client("sns")
client_sqs = boto3.client("sqs")

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table(TABLE_NAME)


def handler(event, context):
    connection_id = event["requestContext"]["connectionId"]
    resources = table.get_item(Key={"userId": "CONN${}".format(connection_id)})["Item"]

    client_sns.unsubscribe(SubscriptionArn=resources["subscription_arn"])
    client_sqs.delete_queue(QueueUrl=resources["queue_url"])
    client_lambda.delete_event_source_mapping(UUID=resources["mapping_uuid"])

    return {"statusCode": 204}
