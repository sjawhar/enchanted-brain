import os

os.environ[
    "CALLBACK_FUNCTION_ARN"
] = "arn:aws:lambda:region:account-id:function:testing-enchanted-brain-callback:live"
os.environ[
    "CALLBACK_SNS_TOPIC_ARN"
] = "arn:aws:sns:region:account-id:testing-enchanted-brain-callback"
os.environ[
    "CALLBACK_SQS_QUEUE_ARN_PREFIX"
] = "arn:aws:sqs:region:account-id:testing-enchanted-brain-callback"
os.environ["DYNAMODB_TABLE_NAME"] = "testing-enchanted-brain"