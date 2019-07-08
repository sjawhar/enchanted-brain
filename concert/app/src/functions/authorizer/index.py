import base64
import json
import os

API_ARN = os.environ.get("API_ARN")
COGNITO_USER_POOL_ID = os.environ.get("COGNITO_USER_POOL_ID")
COGNITO_ADMIN_GROUP_NAME = os.environ.get("COGNITO_ADMIN_GROUP_NAME")

# TODO:
# Verify JWT
# Check that user is in the concert group
# Write method-specific policy based on user groups (admin, vis, etc.)


def handler(event, context):
    token = event["headers"]["Authorization"]
    payload = {"sub": token}

    try:
        payload = json.loads(base64.decode(token.split(".")[1]))
    except Exception as e:
        print(e)

    return {
        "principalId": payload["sub"],
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
    }
