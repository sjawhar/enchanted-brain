import os
from enchanted_brain.attributes import ATTR_USER_ID


def handler(event, context):
    print(ATTR_USER_ID)
    print(event)
    print(os.environ)
    return {"statusCode": 204}
