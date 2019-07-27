import json
import os
import pytest
from botocore.exceptions import ClientError
from botocore.stub import Stubber
from src.functions.on_choice_made.index import handler, sns, firehose

CHOICE_MADE_SNS_ARN = os.environ["CHOICE_MADE_SNS_TOPIC_ARN"]
VISUALIZATION_SNS_ARN = os.environ["CALLBACK_VISUALIZATION_SNS_TOPIC_ARN"]
AGGREGATE_CHOICE_DELIVERY_STREAM_NAME = os.environ[
    "AGGREGATE_CHOICE_DELIVERY_STREAM_NAME"
]

SNS_SUCCESS_RESPONSE = {"ResponseMetadata": {"HTTPStatusCode": 200}}
PUT_RECORD_SUCCESS_RESPONSE = {"RecordId": "record id"}


def get_event(
    choice="COLOR_BLUE",
    choice_type="CHOICE_COLOR",
    timestamp="2017-05-14T20:20:03.000Z",
    user_id="userId",
):
    return {
        "body": json.dumps(
            {
                "data": (
                    {
                        "choiceType": choice_type,
                        "choice": choice,
                        "timestamp": timestamp,
                    }
                )
            }
        ),
        "requestContext": {"authorizer": {"principalId": user_id}},
    }


@pytest.mark.parametrize(
    "choice_type, choice, timestamp, user_id",
    [
        ("CHOICE_COLOR", "COLOR_RED", "2019-05-14T20:20:03.000Z", "colorUser"),
        ("CHOICE_EMOTION_HAPPINESS", 1, "2019-06-14T21:20:03.000Z", "happyUser"),
        ("CHOICE_EMOTION_AGITATION", 1, "2019-07-14T21:20:03.000Z", "agitatedUser"),
        ("CHOICE_CHILLS", 1, "2019-08-14T11:20:03.000Z", "chillyUser"),
    ],
)
def test_choices(choice_type, choice, timestamp, user_id):
    event = get_event(
        user_id=user_id, choice=choice, choice_type=choice_type, timestamp=timestamp
    )

    expected_message = json.dumps(
        {
            "choiceType": choice_type,
            "choice": choice,
            "timestamp": timestamp,
            "userId": user_id,
        }
    )

    choice_made_sns_expected_params = {
        "TopicArn": CHOICE_MADE_SNS_ARN,
        "Message": expected_message,
        "MessageStructure": "string",
    }

    visualization_sns_expected_params = {
        "TopicArn": VISUALIZATION_SNS_ARN,
        "Message": expected_message,
        "MessageStructure": "string",
    }

    firehose_expected_params = {
        "DeliveryStreamName": AGGREGATE_CHOICE_DELIVERY_STREAM_NAME,
        "Record": {"Data": expected_message},
    }

    resp = None
    with Stubber(sns) as sns_stub, Stubber(firehose) as firehose_stub:
        sns_stub.add_response(
            "publish", SNS_SUCCESS_RESPONSE, choice_made_sns_expected_params
        )
        sns_stub.add_response(
            "publish", SNS_SUCCESS_RESPONSE, visualization_sns_expected_params
        )
        firehose_stub.add_response(
            "put_record", PUT_RECORD_SUCCESS_RESPONSE, firehose_expected_params
        )

        resp = handler(event, None)
        sns_stub.assert_no_pending_responses()
        firehose_stub.assert_no_pending_responses()
    assert resp == {"statusCode": 204}


def test_sns_publish_error_raises_client_error():
    with pytest.raises(ClientError):

        with Stubber(sns) as stub:
            stub.add_client_error(
                "publish",
                service_message="Jeff Bezos dislikes you personally and has sabotaged your SNS endpoint",
                service_error_code=500,
            )
            handler(get_event(), None)


def test_firehose_put_record_error_raises_client_error():
    with pytest.raises(ClientError):
        with Stubber(sns) as sns_stub, Stubber(firehose) as firehose_stub:
            sns_stub.add_response("publish", SNS_SUCCESS_RESPONSE)
            sns_stub.add_response("publish", SNS_SUCCESS_RESPONSE)
            firehose_stub.add_client_error(
                "put_record",
                service_message="Jeff Bezos dislikes you personally and has sabotaged your Firehose endpoint",
                service_error_code=500,
            )
            handler(get_event(), None)
