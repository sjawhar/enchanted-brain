import base64
import json
import os

API_ARN = os.environ.get("API_ARN")
COGNITO_USER_POOL_ID = os.environ.get("COGNITO_USER_POOL_ID")
COGNITO_ADMIN_GROUP_NAME = os.environ.get("COGNITO_ADMIN_GROUP_NAME")


def handler(event, context):
    token = event["headers"]["Authorization"]
    # payload = json.loads(base64.decode(token.split('.')[1]))

    return {
        "principalId": token,
        "policyDocument": {
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Effect": "Allow",
                    "Action": "execute-api:Invoke",
                    "Resource": "{}/*".format(API_ARN),
                }
            ],
        },
        "context": {"hello-person": "stringval"},
    }
