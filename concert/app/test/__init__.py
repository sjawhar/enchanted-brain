import os

# setup dummy environment variables
os.environ["AWS_DEFAULT_REGION"] = "us-east-1"
os.environ["EVENT_NAME"] = "CONCERT_LAUSANNE_2019"
os.environ["DYNAMODB_TABLE_NAME"] = "testing-enchanted-brain"
os.environ["API_URL"] = "https://abc.execute-api.us-east-1.amazonaws.com/Prod"
