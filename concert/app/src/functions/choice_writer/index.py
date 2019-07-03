import os
from enchanted_brain.attributes import RECORD_TYPE_CHOICES


def handler(event, context):
    print(RECORD_TYPE_CHOICES)
    print(event)
    print(os.environ)
    return {"statusCode": 204}
