import json
import os
import pytest
from botocore.exceptions import ClientError
from botocore.stub import Stubber
from src.functions.choice_writer.index import handler, dynamodb

dynamo_update_item_success_response = {"ResponseMetadata": {"HTTPStatusCode": 200}}

table_name = os.environ.get("DYNAMODB_TABLE_NAME")
test_timestamp = "2019-05-14T21:20:03.000Z"


def get_event(choice="#AB0000", choice_type="CHOICE_COLOR", user_id="userId"):
    return {
        "Records": [
            {
                "Sns": {
                    "Message": json.dumps(
                        {
                            "userId": user_id,
                            "choiceType": choice_type,
                            "choice": choice,
                            "timestamp": test_timestamp,
                        }
                    )
                }
            }
        ]
    }


@pytest.mark.parametrize(
    "choice_type, choice, choice_key, emotion_type, user_id",
    [
        ("CHOICE_COLOR", "#00AB00", "colors", None, "colorUser"),
        ("CHOICE_EMOTION_HAPPINESS", 1, "emotions", "EMOTION_HAPPINESS", "happyUser"),
        ("CHOICE_EMOTION_ENERGY", 1, "emotions", "EMOTION_ENERGY", "energeticUser"),
        ("CHOICE_CHILLS", 1, "chills", None, "chillyUser"),
    ],
)
def test_choices(choice_type, choice, choice_key, emotion_type, user_id):
    event = get_event(user_id=user_id, choice_type=choice_type, choice=choice)

    expected_params = {
        "TableName": table_name,
        "Key": {"recordId": "$".join(["CHOICE", user_id])},
        "UpdateExpression": "SET #choice_key.#timestamp = :choice_value",
        "ExpressionAttributeNames": {
            "#choice_key": choice_key,
            "#timestamp": test_timestamp,
        },
        "ExpressionAttributeValues": {":choice_value": choice},
        "ReturnValues": "NONE",
    }
    if emotion_type is not None:
        expected_params["UpdateExpression"] += ", #emotion_type = :emotion_type"
        expected_params["ExpressionAttributeNames"]["#emotion_type"] = "emotionType"
        expected_params["ExpressionAttributeValues"][":emotion_type"] = emotion_type

    resp = None
    with Stubber(dynamodb.meta.client) as stub:
        stub.add_response(
            "update_item", dynamo_update_item_success_response, expected_params
        )
        resp = handler(event, None)
        stub.assert_no_pending_responses()

    assert resp == {"statusCode": 204}


def test_invalid_choice_type_raises_value_error():
    with pytest.raises(ValueError):
        event = get_event(choice_type="CHOICE_INVALID")

        handler(event, None)


def test_dynamodb_update_error_raises_client_error():
    with pytest.raises(ClientError):

        with Stubber(dynamodb.meta.client) as stub:
            stub.add_client_error(
                "update_item",
                service_message="Jeff Bezos dislikes you personally and has sabotaged your Dynamo endpoint",
                service_error_code=500,
            )
            handler(get_event(), None)
