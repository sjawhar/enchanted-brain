import boto3
import os

API_URL = os.environ.get("API_URL")

apigateway = boto3.client("apigatewaymanagementapi", endpoint_url=API_URL)


def handler(event, context):

    for record in event["Records"]:
        connection_id = record["eventSourceARN"].split("-")[-1] + "="
        apigateway.post_to_connection(
            Data=str.encode(record["body"]), ConnectionId=connection_id
        )
