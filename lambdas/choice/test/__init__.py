import os

# setup dummy environment variables
os.environ["AWS_DYNAMO_REGION"] = "us-west-2"
os.environ["EVENT_NAME"] = "CONCERT_LAUSANNE_2019"
os.environ["DYNAMODB_TABLE_NAME"] = "choices table"
