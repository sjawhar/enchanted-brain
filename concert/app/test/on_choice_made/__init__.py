import os

# setup dummy environment variables
os.environ["CHOICE_MADE_SNS_TOPIC_ARN"] = "choice made topic"
os.environ["CALLBACK_VISUALIZATION_SNS_TOPIC_ARN"] = "visualization topic"
os.environ["AGGREGATE_CHOICE_DELIVERY_STREAM_NAME"] = "aggregate choice stream"
