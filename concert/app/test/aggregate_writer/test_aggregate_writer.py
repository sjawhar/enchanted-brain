import json
import os
import pytest
from botocore.exceptions import ClientError
from botocore.stub import Stubber
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
                "data": {
                    "CHOICE_SUM": choice_sum,
                    "CHOICE_COUNT": choice_count,
                    "CHOICE_TYPE": choice_type,
                    "CHOICE_TIME": test_timestamp,
                },
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
        "UpdateExpression": "SET #choice_key.#timestamp = {}",
        "ExpressionAttributeNames": {
            "#choice_key": choice_key,
            "#timestamp": test_timestamp,
        },
        "ConditionExpression": "attribute_not_exists(#choice_key.#timestamp)",
        "ReturnValues": "NONE",
    }

    expected_aggregate_update_params = {
        "TableName": table_name,
        "Key": {"recordId": "AGGREGATE"},
        "ExpressionAttributeNames": {
            "#choice_key": choice_key,
            "#timestamp": test_timestamp,
        },
        "ExpressionAttributeValues": {
            ":choice_average": Decimal(choice_sum) / Decimal(choice_count)
        },
        "ReturnValues": "NONE",
    }

    if choice_type.startswith("CHOICE_COLOR"):
        expected_aggregate_update_params[
            "UpdateExpression"
        ] = "ADD #choice_key.#timestamp.#color :choice_average"
        expected_aggregate_update_params["ExpressionAttributeNames"][
            "#color"
        ] = emotion_or_color

    elif choice_type.startswith("CHOICE_EMOTION"):
        expected_aggregate_update_params[
            "UpdateExpression"
        ] = "ADD #choice_key.#timestamp.#emotion :choice_average"
        expected_aggregate_update_params["ExpressionAttributeNames"][
            "#emotion"
        ] = emotion_or_color

    elif choice_type == "CHOICE_CHILLS":
        expected_aggregate_update_params[
            "UpdateExpression"
        ] = "ADD #choice_key.#timestamp :choice_average"

    resp = None
    with Stubber(dynamodb.meta.client) as stub:
        if choice_type != "CHOICE_CHILLS":
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

    assert resp == {record_id: "Ok"}


def test_dynamodb_update_error_raises_client_error():
    with pytest.raises(ClientError):

        with Stubber(dynamodb.meta.client) as stub:
            stub.add_client_error(
                "update_item",
                service_message="Jeff Bezos dislikes you personally and has sabotaged your Dynamo endpoint",
                service_error_code=500,
            )
            handler(get_event(), None)
