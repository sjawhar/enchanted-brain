import json
import os
import pytest
from botocore.exceptions import ClientError
from botocore.stub import Stubber
from base64 import b64encode
from decimal import *
from src.functions.aggregate_writer.index import handler, dynamodb

dynamo_update_item_success_response = {"ResponseMetadata": {"HTTPStatusCode": 200}}

table_name = os.environ.get("DYNAMODB_TABLE_NAME")
test_timestamp = "2019-05-14T21:20:03.000Z"
record_id = "record id"


def get_event(choice_sum=5.0, choice_count=10, choice_type="CHOICE_COLOR_#AB0000"):
    return {
        "records": [
            {
                "recordId": record_id,
                "data": b64encode(
                    str.encode(
                        json.dumps(
                            {
                                "CHOICE_SUM": choice_sum,
                                "CHOICE_COUNT": choice_count,
                                "CHOICE_TYPE": choice_type,
                                "CHOICE_TIME": test_timestamp,
                            }
                        )
                    )
                ),
            }
        ]
    }


@pytest.mark.parametrize(
    "choice_type, choice_sum, choice_count, choice_key, emotion_or_color",
    [
        ("CHOICE_COLOR_#00AB00", 10.0, 5, "colors", "#00AB00"),
        ("CHOICE_EMOTION_HAPPINESS", 12.0, 7, "emotions", "EMOTION_HAPPINESS"),
        ("CHOICE_EMOTION_ENERGY", 0.5, 1, "emotions", "EMOTION_ENERGY"),
        ("CHOICE_CHILLS", 1.5, 3, "chills", None),
    ],
)
def test_choices(choice_type, choice_sum, choice_count, choice_key, emotion_or_color):
    event = get_event(
        choice_sum=choice_sum, choice_count=choice_count, choice_type=choice_type
    )

    expected_map_creation_params = {
        "TableName": table_name,
        "Key": {"recordId": "AGGREGATE"},
        "UpdateExpression": "SET #choice_key.#timestamp = if_not_exists(#choice_key.#timestamp, :empty_map)",
        "ExpressionAttributeNames": {
            "#choice_key": choice_key,
            "#timestamp": test_timestamp,
        },
        "ExpressionAttributeValues": {":empty_map": {}},
        "ReturnValues": "NONE",
    }

    expected_aggregate_update_params = {
        "TableName": table_name,
        "Key": {"recordId": "AGGREGATE"},
        "UpdateExpression": "ADD #choice_key.#timestamp.#choice_string :choice_sum, #choice_key.#timestamp.#total_choices :choice_count",
        "ExpressionAttributeNames": {
            "#choice_key": choice_key,
            "#timestamp": test_timestamp,
            "#total_choices": "choices",
        },
        "ExpressionAttributeValues": {
            ":choice_sum": Decimal(choice_sum),
            ":choice_count": choice_count,
        },
        "ReturnValues": "NONE",
    }

    if choice_type.startswith("CHOICE_COLOR"):
        expected_aggregate_update_params["ExpressionAttributeNames"][
            "#choice_string"
        ] = emotion_or_color

    elif choice_type.startswith("CHOICE_EMOTION"):
        expected_aggregate_update_params["ExpressionAttributeNames"][
            "#choice_string"
        ] = emotion_or_color
        expected_aggregate_update_params["ExpressionAttributeNames"][
            "#total_choices"
        ] = "choices_{}".format(emotion_or_color)

    elif choice_type == "CHOICE_CHILLS":
        expected_aggregate_update_params["ExpressionAttributeNames"][
            "#choice_string"
        ] = "chills"

    resp = None
    with Stubber(dynamodb.meta.client) as stub:
        stub.add_response(
            "update_item",
            dynamo_update_item_success_response,
            expected_map_creation_params,
        )
        stub.add_response(
            "update_item",
            dynamo_update_item_success_response,
            expected_aggregate_update_params,
        )
        resp = handler(event, None)
        stub.assert_no_pending_responses()

    assert resp == {"records": [{"recordId": record_id, "result": "Ok"}]}


def test_dynamodb_update_error_results_in_delivery_failed():
    resp = None
    with Stubber(dynamodb.meta.client) as stub:
        stub.add_client_error(
            "update_item",
            service_error_code="not a ConditionalCheckFailedException (conditional map creation failed)",
        )
        resp = handler(get_event(), None)

    assert resp == {"records": [{"recordId": record_id, "result": "DeliveryFailed"}]}
