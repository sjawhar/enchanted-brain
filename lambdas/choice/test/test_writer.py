import os
import pytest
from src.writer import handler, dynamodb
from botocore.stub import Stubber

dynamo_update_item_success_response = {"ResponseMetadata": {"HTTPStatusCode": 200}}

table_name = os.environ["DYNAMODB_TABLE_NAME"]
song_id = os.environ["EVENT_NAME"]
test_user_id = "user id"
test_timestamp = "999999"

# Test that color choice event results in DynamoDB write with expected parameters
def test_handler_color_chosen():
    event = {
        "userId": test_user_id,
        "choiceType": "CHOICE_COLOR",
        "choice": "chartreuse",
        "timestamp": test_timestamp,
    }

    expected_params = {
        "TableName": table_name,
        "Key": {"songId": song_id, "listenId": test_user_id},
        "UpdateExpression": "SET #choice_key.#timestamp = :choice_value",
        "ExpressionAttributeNames": {
            "#choice_key": "colors",
            "#timestamp": test_timestamp,
        },
        "ExpressionAttributeValues": {":choice_value": event["choice"]},
        "ReturnValues": "NONE",
    }

    with Stubber(dynamodb.meta.client) as stub:
        stub.add_response(
            "update_item", dynamo_update_item_success_response, expected_params
        )
        resp = handler(event, None)
        assert resp == {"statusCode": 204}


# Test that emotion choice event results in DynamoDB write with expected parameters
def test_handler_emotion_chosen():
    event = {
        "userId": test_user_id,
        "choiceType": "CHOICE_EMOTION",
        "choice": "sad",
        "timestamp": test_timestamp,
    }

    expected_params = {
        "TableName": table_name,
        "Key": {"songId": song_id, "listenId": test_user_id},
        "UpdateExpression": "SET #choice_key.#timestamp = :choice_value",
        "ExpressionAttributeNames": {
            "#choice_key": "emotions",
            "#timestamp": test_timestamp,
        },
        "ExpressionAttributeValues": {":choice_value": event["choice"]},
        "ReturnValues": "NONE",
    }

    with Stubber(dynamodb.meta.client) as stub:
        stub.add_response(
            "update_item", dynamo_update_item_success_response, expected_params
        )
        resp = handler(event, None)
        assert resp == {"statusCode": 204}


# Test that imagery choice event results in DynamoDB write with expected parameters
def test_handler_imagery_chosen():
    event = {
        "userId": test_user_id,
        "choiceType": "CHOICE_IMAGERY",
        "choice": "a sunset",
        "timestamp": test_timestamp,
    }

    expected_params = {
        "TableName": table_name,
        "Key": {"songId": song_id, "listenId": test_user_id},
        "UpdateExpression": "SET #choice_key = :choice_value",
        "ExpressionAttributeNames": {"#choice_key": "imagery"},
        "ExpressionAttributeValues": {":choice_value": event["choice"]},
        "ReturnValues": "NONE",
    }

    with Stubber(dynamodb.meta.client) as stub:
        stub.add_response(
            "update_item", dynamo_update_item_success_response, expected_params
        )
        resp = handler(event, None)
        assert resp == {"statusCode": 204}


# Test that chills choice event results in DynamoDB write with expected parameters
def test_handler_chills_chosen():
    event = {
        "userId": test_user_id,
        "choiceType": "CHOICE_CHILLS",
        "choice": True,
        "timestamp": test_timestamp,
    }

    expected_params = {
        "TableName": table_name,
        "Key": {"songId": song_id, "listenId": test_user_id},
        "UpdateExpression": "SET #choice_key.#timestamp = :choice_value",
        "ExpressionAttributeNames": {
            "#choice_key": "chills",
            "#timestamp": test_timestamp,
        },
        "ExpressionAttributeValues": {":choice_value": event["choice"]},
        "ReturnValues": "NONE",
    }

    with Stubber(dynamodb.meta.client) as stub:
        stub.add_response(
            "update_item", dynamo_update_item_success_response, expected_params
        )
        resp = handler(event, None)
        assert resp == {"statusCode": 204}


# Test that invalid data results in ValueError being raised
def test_handler_invalid_input():
    with pytest.raises(ValueError):
        event = {
            "userId": test_user_id,
            "choiceType": "INVALID CHOICE",
            "choice": "(ツ)",
            "timestamp": test_timestamp,
        }

        handler(event, None)


# Test that Dynamo client error results in exception being thrown
def test_handler_dynamo_error():
    with pytest.raises(Exception):

        event = {
            "userId": test_user_id,
            "choiceType": "CHOICE_COLOR",
            "choice": "chartreuse",
            "timestamp": test_timestamp,
        }

        with Stubber(dynamodb.meta.client) as stub:
            stub.add_client_error(
                "update_item",
                service_message="Jeff Bezos dislikes you personally and has sabotaged your Dynamo endpoint",
                service_error_code=500,
            )
            handler(event, None)
