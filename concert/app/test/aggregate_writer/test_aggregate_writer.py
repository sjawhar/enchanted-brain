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


def get_event(
    choice_sum=5.0,
    choice_count=10,
    choice_type="CHOICE_COLOR_#AB0000",
    choice_time="2019-05-14 21:20:03.000",
    record_id=record_id,
):
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
                                "CHOICE_TIME": choice_time,
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
        ("CHOICE_EMOTION_ANGER", 0.5, 1, "emotions", "EMOTION_ANGER"),
        ("CHOICE_CHILLS", 1.5, 3, "chills", None),
    ],
)
def test_empty_map_created_for_choices(
    choice_type, choice_sum, choice_count, choice_key, emotion_or_color
):
    event = get_event(
        choice_sum=choice_sum, choice_count=choice_count, choice_type=choice_type
    )

    expected_map_creation_params = {
        "TableName": table_name,
        "Key": {"recordId": "AGGREGATE"},
        "UpdateExpression": "SET #k0.#t0 = if_not_exists(#k0.#t0, :e)",
        "ExpressionAttributeNames": {"#k0": choice_key, "#t0": test_timestamp},
        "ExpressionAttributeValues": {":e": {}},
        "ReturnValues": "NONE",
    }

    resp = None
    with Stubber(dynamodb.meta.client) as stub:
        stub.add_response(
            "update_item",
            dynamo_update_item_success_response,
            expected_map_creation_params,
        )
        stub.add_response("update_item", dynamo_update_item_success_response)
        resp = handler(event, None)
        stub.assert_no_pending_responses()

    assert resp == {"records": [{"recordId": record_id, "result": "Ok"}]}


@pytest.mark.parametrize(
    "choice_type, choice_sum_key, choice_count_key, choice_sum_value, choice_count_value, choice_key",
    [
        ("CHOICE_COLOR_#00AB00", "sum_#00AB00", "count", 10.0, 5, "colors"),
        (
            "CHOICE_EMOTION_HAPPINESS",
            "sum_EMOTION_HAPPINESS",
            "count_EMOTION_HAPPINESS",
            12.0,
            7,
            "emotions",
        ),
        (
            "CHOICE_EMOTION_ANGER",
            "sum_EMOTION_ANGER",
            "count_EMOTION_ANGER",
            0.5,
            1,
            "emotions",
        ),
        ("CHOICE_CHILLS", "sum", "count", 1.5, 3, "chills"),
    ],
)
def test_choices_added_to_aggregate_record(
    choice_type,
    choice_sum_key,
    choice_count_key,
    choice_sum_value,
    choice_count_value,
    choice_key,
):
    event = get_event(
        choice_sum=choice_sum_value,
        choice_count=choice_count_value,
        choice_type=choice_type,
    )

    expected_aggregate_update_params = {
        "TableName": table_name,
        "Key": {"recordId": "AGGREGATE"},
        "UpdateExpression": "ADD #k0.#t0.#s0 :s0, #k0.#t0.#c0 :c0",
        "ExpressionAttributeNames": {
            "#k0": choice_key,
            "#t0": test_timestamp,
            "#c0": choice_count_key,
            "#s0": choice_sum_key,
        },
        "ExpressionAttributeValues": {
            ":s0": Decimal(choice_sum_value),
            ":c0": choice_count_value,
        },
        "ReturnValues": "NONE",
    }

    resp = None
    with Stubber(dynamodb.meta.client) as stub:
        stub.add_response("update_item", dynamo_update_item_success_response)
        stub.add_response(
            "update_item",
            dynamo_update_item_success_response,
            expected_aggregate_update_params,
        )
        resp = handler(event, None)
        stub.assert_no_pending_responses()

    assert resp == {"records": [{"recordId": record_id, "result": "Ok"}]}


def test_multiple_records_result_in_multiple_dynamo_calls():
    event1 = get_event(record_id="record id 1")
    event2 = get_event(record_id="record id 2")
    event3 = get_event(record_id="record id 3")
    event = {
        "records": [
            get_event(
                record_id="record id 1",
                choice_type="CHOICE_COLOR_#AB0000",
                choice_time="2019-05-14 21:20:03.000",
                choice_sum="1",
                choice_count="1",
            )["records"][0],
            get_event(
                record_id="record id 2",
                choice_type="CHOICE_COLOR_#00AB00",
                choice_time="2019-05-14 21:20:03.000",
                choice_sum="2",
                choice_count="2",
            )["records"][0],
            get_event(
                record_id="record id 3",
                choice_type="CHOICE_COLOR_#AB0000",
                choice_time="2019-05-14 21:20:03.200",
                choice_sum="3",
                choice_count="3",
            )["records"][0],
            get_event(
                record_id="record id 4",
                choice_type="CHOICE_CHILLS",
                choice_time="2019-05-14 21:20:03.200",
                choice_sum="4.5",
                choice_count="6",
            )["records"][0],
        ]
    }

    resp = None
    with Stubber(dynamodb.meta.client) as stub:
        stub.add_response(
            "update_item",
            dynamo_update_item_success_response,
            {
                "UpdateExpression": "SET #k0.#t0 = if_not_exists(#k0.#t0, :e), #k0.#t2 = if_not_exists(#k0.#t2, :e), #k3.#t2 = if_not_exists(#k3.#t2, :e)",
                "TableName": table_name,
                "Key": {"recordId": "AGGREGATE"},
                "ExpressionAttributeNames": {
                    "#k0": "colors",
                    "#k3": "chills",
                    "#t0": "2019-05-14T21:20:03.000Z",
                    "#t2": "2019-05-14T21:20:03.200Z",
                },
                "ExpressionAttributeValues": {":e": {}},
                "ReturnValues": "NONE",
            },
        )
        stub.add_response(
            "update_item",
            dynamo_update_item_success_response,
            {
                "UpdateExpression": "ADD #k0.#t0.#s0 :c0, #k0.#t0.#c0 :c0, #k0.#t0.#s1 :c1, #k0.#t0.#c0 :c1, #k0.#t2.#s0 :c2, #k0.#t2.#c0 :c2, #k3.#t2.#s3 :s3, #k3.#t2.#c0 :c3",
                "TableName": table_name,
                "Key": {"recordId": "AGGREGATE"},
                "ExpressionAttributeNames": {
                    "#k0": "colors",
                    "#k3": "chills",
                    "#t0": "2019-05-14T21:20:03.000Z",
                    "#t2": "2019-05-14T21:20:03.200Z",
                    "#c0": "count",
                    "#s0": "sum_#AB0000",
                    "#s1": "sum_#00AB00",
                    "#s3": "sum",
                },
                "ExpressionAttributeValues": {
                    ":c0": "1",
                    ":c1": "2",
                    ":c2": "3",
                    ":c3": "6",
                    ":s3": "4.5",
                },
                "ReturnValues": "NONE",
            },
        )
        resp = handler(event, None)
        stub.assert_no_pending_responses()

    assert resp == {
        "records": [
            {"recordId": "record id 1", "result": "Ok"},
            {"recordId": "record id 2", "result": "Ok"},
            {"recordId": "record id 3", "result": "Ok"},
            {"recordId": "record id 4", "result": "Ok"},
        ]
    }


def test_dynamodb_update_error_results_in_delivery_failed():
    resp = None
    with Stubber(dynamodb.meta.client) as stub:
        stub.add_client_error("update_item")
        resp = handler(get_event(), None)

    assert resp == {"records": [{"recordId": record_id, "result": "DeliveryFailed"}]}
