import base64
import hashlib
import json
import os
import time
from jose import jwk, jwt
from jose.utils import base64url_decode
from urllib.request import urlopen

API_ARN = os.environ.get("API_ARN")
API_METHOD_CHOICE_MADE = os.environ.get("API_METHOD_CHOICE_MADE")
API_METHOD_EVENT_STAGE_CHANGED = os.environ.get("API_METHOD_EVENT_STAGE_CHANGED")
COGNITO_APP_CLIENT_ID = os.environ.get("COGNITO_APP_CLIENT_ID")
COGNITO_GROUP_ADMIN = os.environ.get("COGNITO_GROUP_ADMIN")
COGNITO_GROUP_VISUALIZATION = os.environ.get("COGNITO_GROUP_VISUALIZATION")
COGNITO_USER_POOL_ID = os.environ.get("COGNITO_USER_POOL_ID")
COGNITO_REGION = COGNITO_USER_POOL_ID.split("_")[0]

response = urlopen(
    "https://cognito-idp.{}.amazonaws.com/{}/.well-known/jwks.json".format(
        COGNITO_REGION, COGNITO_USER_POOL_ID
    )
)
JWKS_KEYS = json.loads(response.read())["keys"]

CHOICE_BUCKETS = [
    "CHOICE_COLOR",
    "CHOICE_COLOR",
    "CHOICE_EMOTION_HAPPINESS",
    "CHOICE_EMOTION_ENERGY",
]
NUM_BUCKETS = len(CHOICE_BUCKETS)


def get_verified_token(token):
    headers = jwt.get_unverified_headers(token)
    kid = headers["kid"]

    key_index = -1
    for i in range(len(JWKS_KEYS)):
        if kid == JWKS_KEYS[i]["kid"]:
            key_index = i
            break
    if key_index == -1:
        return None

    return jwt.decode(token, JWKS_KEYS[key_index], audience=COGNITO_APP_CLIENT_ID)


def get_choice_vars(user_id):
    user_id_hash = int(hashlib.md5(user_id.encode("utf-8")).hexdigest(), 16)
    choice_mod = user_id_hash % (NUM_BUCKETS * 2)
    context = {
        "choiceType": CHOICE_BUCKETS[int(choice_mod / 2)],
        "choiceInverted": bool(choice_mod % 2),
    }
    return context


def handler(event, context):
    policy = {
        "principalId": "Unauthorized",
        "policyDocument": {
            "Version": "2012-10-17",
            "Statement": [
                {"Effect": "Deny", "Action": "execute-api:Invoke", "Resource": "*"}
            ],
        },
        "context": {},
    }

    try:
        token = get_verified_token(event["headers"]["Authorization"])
        if not token:
            raise Exception("Token not verified")
    except Exception as e:
        print(e)
        return policy

    policy["principalId"] = token["sub"]
    statement = policy["policyDocument"]["Statement"][0]
    statement["Effect"] = "Allow"
    statement["Resource"] = [
        "{}/{}".format(API_ARN, method) for method in ["$connect", "$disconnect"]
    ]
    groups = token.get("cognito:groups") or []

    if COGNITO_GROUP_ADMIN in groups:
        statement["Resource"].append(
            "{}/{}".format(API_ARN, API_METHOD_EVENT_STAGE_CHANGED)
        )
    elif COGNITO_GROUP_VISUALIZATION not in groups:
        # User is an audience member
        statement["Resource"].append("{}/{}".format(API_ARN, API_METHOD_CHOICE_MADE))
        policy["context"] = get_choice_vars(policy["principalId"])

    for group in groups:
        policy["context"]["is{}".format(group)] = True
    return policy
