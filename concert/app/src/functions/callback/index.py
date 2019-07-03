import json
import os
import request as vendor_request
from urllib import request, parse

websocket_uri = "https://gem4rt4c0j.execute-api.us-east-1.amazonaws.com/Prod"


def handler(event, context):
    # print(event)
    # print(os.environ)
    print(vendor_request)

    records = event["Records"]
    for record in records:
        source_arn = record["eventSourceARN"]
        connectionId = source_arn.split("callback-")[1]
        body = record["body"]
        data = parse.urlencode(body).encode()
        req = request.Request(
            websocket_uri + "/@connections/" + connectionId, data=data
        )
        resp = request.urlopen(req)
        print(resp)
    return {"statusCode": 204}


"""
POST shape:
POST https://{api-id}.execute-api.us-east-1.amazonaws.com/{stage}/@connections/{connection_id}
SQS event shape:
{
    "Records": [
        {
            "messageId": "059f36b4-87a3-44ab-83d2-661975830a7d",
            "receiptHandle": "AQEBwJnKyrHigUMZj6rYigCgxlaS3SLy0a...",
            "body": {"field: "value"},
            "attributes": {
                "ApproximateReceiveCount": "1",
                "SentTimestamp": "1545082649183",
                "SenderId": "AIDAIENQZJOLO23YVJ4VO",
                "ApproximateFirstReceiveTimestamp": "1545082649185"
            },
            "messageAttributes": {},
            "md5OfBody": "098f6bcd4621d373cade4e832627b4f6",
            "eventSource": "aws:sqs",
            "eventSourceARN": "arn:aws:sqs:us-east-2:123456789012:my-queue",
            "awsRegion": "us-east-2"
        },
        ...
    ]
}
"""
