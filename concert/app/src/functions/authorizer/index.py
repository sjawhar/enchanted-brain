import os


def handler(event, context):
    print(event)
    print(context)
    print(os.environ)
    return {"statusCode": 204}
