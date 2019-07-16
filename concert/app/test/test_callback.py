import json
import os
import pytest
from botocore.exceptions import ClientError
from botocore.stub import Stubber
from src.functions.callback.index import handler, apigateway

post_to_connection_success_response = {"ResponseMetadata": {"HTTPStatusCode": 200}}

table_name = os.environ["API_URL"]

event_body = {"field1": "value1", "field2": "value2"}


def get_event(eventSourceARN="arn:aws:sqs:us-east-1:123456789012:callback-123456"):
    return {
        "Records": [{"body": json.dumps(event_body), "eventSourceARN": eventSourceARN}]
    }


def test_callback():
    event = get_event()

    expected_params = {"Data": json.dumps(event_body), "ConnectionId": "123456="}

    with Stubber(apigateway) as stub:
        stub.add_response(
            "post_to_connection", post_to_connection_success_response, expected_params
        )
        handler(event, None)


def test_invalid_message_raises_exception():
    event = get_event(eventSourceARN="not a callback queue")

    with pytest.raises(Exception):
        handler(event, None)


def test_post_to_connection_error_raises_client_error():
    with pytest.raises(ClientError):

        with Stubber(apigateway) as stub:
            stub.add_client_error(
                "post_to_connection",
                service_message="Jeff Bezos dislikes you personally and has sabotaged your API Gateway endpoint",
                service_error_code=500,
            )
            handler(get_event(), None)
