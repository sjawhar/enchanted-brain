import json
import os
import pytest
from botocore.exceptions import ClientError
from botocore.stub import Stubber
from src.functions.on_event_stage_changed.index import handler, sns, dynamodb

CALLBACK_SNS_ARN = os.environ["CALLBACK_GLOBAL_SNS_TOPIC_ARN"]
TABLE_NAME = os.environ.get("DYNAMODB_TABLE_NAME")

SUCCESS_RESPONSE = {"ResponseMetadata": {"HTTPStatusCode": 200}}

DYNAMO_GET_SONG_LIST_AND_AGGREGATE_CHOICES_RESPONSE = {
    "Responses": [
        {
            "Item": {
                "recordId": {"S": "SONG_LIST"},
                "songs": {
                    "L": [
                        {
                            "M": {
                                "displayName": {"S": "song title 1"},
                                "endTime": {"S": "2019-05-14T21:16:33.000Z"},
                                "startTime": {"S": "2019-05-14T21:15:03.000Z"},
                            }
                        },
                        {
                            "M": {
                                "displayName": {"S": "song title 2"},
                                "endTime": {"S": "2019-05-14T21:21:33.000Z"},
                                "startTime": {"S": "2019-05-14T21:20:03.000Z"},
                            }
                        },
                    ]
                },
            }
        },
        {
            "Item": {
                "recordId": {"S": "AGGREGATE"},
                "chills": {
                    "M": {
                        "2019-05-14T21:20:03.000Z": {
                            "M": {"count": {"N": "2"}, "sum": {"N": "2.5"}}
                        },
                        "2019-05-14T21:20:03.200Z": {
                            "M": {"count": {"N": "1"}, "sum": {"N": "1.5"}}
                        },
                    }
                },
                "colors": {
                    "M": {
                        "2019-05-14T21:15:03.000Z": {
                            "M": {
                                "count": {"N": "20"},
                                "sum_#ABABAB": {"N": "5"},
                                "sum_#171717": {"N": "15"},
                            }
                        },
                        "2019-05-14T21:15:23.000Z": {
                            "M": {
                                "count": {"N": "17"},
                                "sum_#ABABAB": {"N": "10"},
                                "sum_#CDCDCD": {"N": "7"},
                            }
                        },
                    }
                },
            }
        },
    ]
}


def get_event(
    stage_id="STAGE_CHOICE_COLOR_EMOTION",
    display_name=None,
    start_time=None,
    end_time=None,
    frequency=None,
    form_url=None,
):
    data = {"stageId": stage_id}
    if display_name:
        data["displayName"] = display_name
    if start_time:
        data["startTime"] = start_time
    if end_time:
        data["endTime"] = end_time
    if frequency:
        data["frequency"] = frequency
    if form_url:
        data["formUrl"] = form_url
    return {"body": json.dumps({"event": "EVENT_STAGE_CHANGED", "data": data})}


@pytest.mark.parametrize(
    "stage_id, display_name, start_time, end_time, frequency, form_url, expected_message",
    [
        (
            "STAGE_CHOICE_SYNESTHESIA",
            "Canon in D",
            "2019-05-14T21:20:03.000Z",
            "2019-05-14T21:21:33.000Z",
            20,
            None,
            json.dumps(
                {
                    "event": "EVENT_STAGE_CHANGED",
                    "data": {
                        "stageId": "STAGE_CHOICE_SYNESTHESIA",
                        "displayName": "Canon in D",
                        "startTime": "2019-05-14T21:20:03.000Z",
                        "endTime": "2019-05-14T21:21:33.000Z",
                        "frequency": 20,
                    },
                }
            ),
        ),
        (
            "STAGE_CHOICE_CHILLS",
            "Canon in E",
            "2019-05-14T21:20:03.000Z",
            "2019-05-14T21:21:33.000Z",
            None,
            None,
            json.dumps(
                {
                    "event": "EVENT_STAGE_CHANGED",
                    "data": {
                        "stageId": "STAGE_CHOICE_CHILLS",
                        "displayName": "Canon in E",
                        "startTime": "2019-05-14T21:20:03.000Z",
                        "endTime": "2019-05-14T21:21:33.000Z",
                    },
                }
            ),
        ),
        (
            "STAGE_CHOICE_IMAGERY",
            None,
            None,
            None,
            None,
            "website.com",
            json.dumps(
                {
                    "event": "EVENT_STAGE_CHANGED",
                    "data": {
                        "stageId": "STAGE_CHOICE_IMAGERY",
                        "formUrl": "website.com",
                    },
                }
            ),
        ),
    ],
)
def test_callback_message_published_on_event_stage_change(
    stage_id, display_name, start_time, end_time, frequency, form_url, expected_message
):
    event = get_event(stage_id, display_name, start_time, end_time, frequency, form_url)

    sns_expected_params = {
        "TopicArn": CALLBACK_SNS_ARN,
        "Message": expected_message,
        "MessageStructure": "string",
    }

    resp = None
    with Stubber(dynamodb) as dynamo_stub, Stubber(sns) as sns_stub:
        dynamo_stub.add_response("transact_write_items", SUCCESS_RESPONSE)
        sns_stub.add_response("publish", SUCCESS_RESPONSE, sns_expected_params)

        resp = handler(event, None)
        sns_stub.assert_no_pending_responses()
        dynamo_stub.assert_no_pending_responses()

    assert resp == {"statusCode": 204}


@pytest.mark.parametrize(
    "stage_id, display_name, start_time, end_time, frequency, form_url, expected_transaction_items",
    [
        (
            "STAGE_CHOICE_SYNESTHESIA",
            "Canon in D",
            "2019-05-14T21:20:03.000Z",
            "2019-05-14T21:21:33.000Z",
            20,
            None,
            [
                {
                    "Put": {
                        "Item": {
                            "recordId": {"S": "EVENT_STAGE"},
                            "stageId": {"S": "STAGE_CHOICE_SYNESTHESIA"},
                            "displayName": {"S": "Canon in D"},
                            "startTime": {"S": "2019-05-14T21:20:03.000Z"},
                            "endTime": {"S": "2019-05-14T21:21:33.000Z"},
                            "frequency": {"N": "20"},
                        },
                        "TableName": TABLE_NAME,
                    }
                },
                {
                    "Update": {
                        "Key": {"recordId": {"S": "SONG_LIST"}},
                        "UpdateExpression": "SET #songs = list_append(if_not_exists(#songs, :empty_list), :song)",
                        "ExpressionAttributeNames": {"#songs": "songs"},
                        "ExpressionAttributeValues": {
                            ":song": {
                                "L": [
                                    {
                                        "M": {
                                            "displayName": {"S": "Canon in D"},
                                            "startTime": {
                                                "S": "2019-05-14T21:20:03.000Z"
                                            },
                                            "endTime": {
                                                "S": "2019-05-14T21:21:33.000Z"
                                            },
                                        }
                                    }
                                ]
                            },
                            ":empty_list": {"L": []},
                        },
                        "TableName": TABLE_NAME,
                    }
                },
            ],
        ),
        (
            "STAGE_CHOICE_CHILLS",
            "Canon in E",
            "2019-05-14T21:20:03.000Z",
            "2019-05-14T21:21:33.000Z",
            None,
            None,
            [
                {
                    "Put": {
                        "Item": {
                            "recordId": {"S": "EVENT_STAGE"},
                            "stageId": {"S": "STAGE_CHOICE_CHILLS"},
                            "displayName": {"S": "Canon in E"},
                            "startTime": {"S": "2019-05-14T21:20:03.000Z"},
                            "endTime": {"S": "2019-05-14T21:21:33.000Z"},
                        },
                        "TableName": TABLE_NAME,
                    }
                },
                {
                    "Update": {
                        "Key": {"recordId": {"S": "SONG_LIST"}},
                        "UpdateExpression": "SET #songs = list_append(if_not_exists(#songs, :empty_list), :song)",
                        "ExpressionAttributeNames": {"#songs": "songs"},
                        "ExpressionAttributeValues": {
                            ":song": {
                                "L": [
                                    {
                                        "M": {
                                            "displayName": {"S": "Canon in E"},
                                            "startTime": {
                                                "S": "2019-05-14T21:20:03.000Z"
                                            },
                                            "endTime": {
                                                "S": "2019-05-14T21:21:33.000Z"
                                            },
                                        }
                                    }
                                ]
                            },
                            ":empty_list": {"L": []},
                        },
                        "TableName": TABLE_NAME,
                    }
                },
            ],
        ),
        (
            "STAGE_CHOICE_IMAGERY",
            None,
            None,
            None,
            None,
            "website.com",
            [
                {
                    "Put": {
                        "Item": {
                            "recordId": {"S": "EVENT_STAGE"},
                            "stageId": {"S": "STAGE_CHOICE_IMAGERY"},
                            "formUrl": {"S": "website.com"},
                        },
                        "TableName": TABLE_NAME,
                    }
                }
            ],
        ),
    ],
)
def test_event_stage_and_song_list_updated_on_event_stage_change(
    stage_id,
    display_name,
    start_time,
    end_time,
    frequency,
    form_url,
    expected_transaction_items,
):
    event = get_event(stage_id, display_name, start_time, end_time, frequency, form_url)

    dynamo_expected_params = {"TransactItems": expected_transaction_items}

    resp = None
    with Stubber(dynamodb) as dynamo_stub, Stubber(sns) as sns_stub:
        dynamo_stub.add_response(
            "transact_write_items", SUCCESS_RESPONSE, dynamo_expected_params
        )
        sns_stub.add_response("publish", SUCCESS_RESPONSE)

        resp = handler(event, None)
        dynamo_stub.assert_no_pending_responses()
        sns_stub.assert_no_pending_responses()

    assert resp == {"statusCode": 204}


def test_retrieve_song_list_and_aggregate_choices_on_stage_end():
    event = get_event("STAGE_END")

    expected_transaction_items = [
        {"Get": {"Key": {"recordId": {"S": "SONG_LIST"}}, "TableName": TABLE_NAME}},
        {"Get": {"Key": {"recordId": {"S": "AGGREGATE"}}, "TableName": TABLE_NAME}},
    ]

    dynamo_expected_get_params = {"TransactItems": expected_transaction_items}

    resp = None
    with Stubber(dynamodb) as dynamo_stub, Stubber(sns) as sns_stub:
        dynamo_stub.add_response(
            "transact_get_items",
            DYNAMO_GET_SONG_LIST_AND_AGGREGATE_CHOICES_RESPONSE,
            dynamo_expected_get_params,
        )
        dynamo_stub.add_response("transact_write_items", SUCCESS_RESPONSE)
        sns_stub.add_response("publish", SUCCESS_RESPONSE)

        resp = handler(event, None)
        dynamo_stub.assert_no_pending_responses()
        sns_stub.assert_no_pending_responses()

    assert resp == {"statusCode": 204}


def test_song_list_and_aggregate_choices_sent_to_callback_on_stage_end():
    event = get_event("STAGE_END")

    expected_songs_list = [
        {
            "displayName": "song title 1",
            "startTime": "2019-05-14T21:15:03.000Z",
            "endTime": "2019-05-14T21:16:33.000Z",
            "choiceType": "colors",
            "choices": [
                {"timestamp": "2019-05-14T21:15:03.000Z", "#ABABAB": 5, "#171717": 15},
                {"timestamp": "2019-05-14T21:15:23.000Z", "#ABABAB": 10, "#CDCDCD": 7},
            ],
        },
        {
            "displayName": "song title 2",
            "startTime": "2019-05-14T21:20:03.000Z",
            "endTime": "2019-05-14T21:21:33.000Z",
            "choiceType": "chills",
            "choices": [
                {"timestamp": "2019-05-14T21:20:03.000Z", "sum": 2.5, "count": 2},
                {"timestamp": "2019-05-14T21:20:03.200Z", "sum": 1.5, "count": 1},
            ],
        },
    ]

    sns_expected_message = json.dumps(
        {
            "event": "EVENT_STAGE_CHANGED",
            "data": {"stageId": "STAGE_END", "songs": expected_songs_list},
        }
    )

    sns_expected_params = {
        "TopicArn": CALLBACK_SNS_ARN,
        "Message": sns_expected_message,
        "MessageStructure": "string",
    }

    resp = None
    with Stubber(dynamodb) as dynamo_stub, Stubber(sns) as sns_stub:
        dynamo_stub.add_response(
            "transact_get_items", DYNAMO_GET_SONG_LIST_AND_AGGREGATE_CHOICES_RESPONSE
        )
        dynamo_stub.add_response("transact_write_items", SUCCESS_RESPONSE)
        sns_stub.add_response("publish", SUCCESS_RESPONSE, sns_expected_params)

        resp = handler(event, None)
        dynamo_stub.assert_no_pending_responses()
        sns_stub.assert_no_pending_responses()

    assert resp == {"statusCode": 204}


def test_song_list_and_aggregate_choices_added_to_event_stage_on_stage_end():
    event = get_event("STAGE_END")

    dynamo_put_expected_transaction_items = [
        {
            "Put": {
                "Item": {
                    "recordId": {"S": "EVENT_STAGE"},
                    "stageId": {"S": "STAGE_END"},
                    "songs": {
                        "L": [
                            {
                                "M": {
                                    "displayName": {"S": "song title 1"},
                                    "startTime": {"S": "2019-05-14T21:15:03.000Z"},
                                    "endTime": {"S": "2019-05-14T21:16:33.000Z"},
                                    "choiceType": {"S": "colors"},
                                    "choices": {
                                        "L": [
                                            {
                                                "M": {
                                                    "timestamp": {
                                                        "S": "2019-05-14T21:15:03.000Z"
                                                    },
                                                    "#ABABAB": {"N": "5"},
                                                    "#171717": {"N": "15"},
                                                }
                                            },
                                            {
                                                "M": {
                                                    "timestamp": {
                                                        "S": "2019-05-14T21:15:23.000Z"
                                                    },
                                                    "#ABABAB": {"N": "10"},
                                                    "#CDCDCD": {"N": "7"},
                                                }
                                            },
                                        ]
                                    },
                                }
                            },
                            {
                                "M": {
                                    "displayName": {"S": "song title 2"},
                                    "startTime": {"S": "2019-05-14T21:20:03.000Z"},
                                    "endTime": {"S": "2019-05-14T21:21:33.000Z"},
                                    "choiceType": {"S": "chills"},
                                    "choices": {
                                        "L": [
                                            {
                                                "M": {
                                                    "timestamp": {
                                                        "S": "2019-05-14T21:20:03.000Z"
                                                    },
                                                    "sum": {"N": "2.5"},
                                                    "count": {"N": "2"},
                                                }
                                            },
                                            {
                                                "M": {
                                                    "timestamp": {
                                                        "S": "2019-05-14T21:20:03.200Z"
                                                    },
                                                    "sum": {"N": "1.5"},
                                                    "count": {"N": "1"},
                                                }
                                            },
                                        ]
                                    },
                                }
                            },
                        ]
                    },
                },
                "TableName": TABLE_NAME,
            }
        }
    ]

    dynamo_expected_params = {"TransactItems": dynamo_put_expected_transaction_items}

    resp = None
    with Stubber(dynamodb) as dynamo_stub, Stubber(sns) as sns_stub:
        dynamo_stub.add_response(
            "transact_get_items", DYNAMO_GET_SONG_LIST_AND_AGGREGATE_CHOICES_RESPONSE
        )
        dynamo_stub.add_response(
            "transact_write_items", SUCCESS_RESPONSE, dynamo_expected_params
        )
        sns_stub.add_response("publish", SUCCESS_RESPONSE)

        resp = handler(event, None)
        dynamo_stub.assert_no_pending_responses()
        sns_stub.assert_no_pending_responses()

    assert resp == {"statusCode": 204}


def test_sns_publish_error_raises_client_error():
    with pytest.raises(ClientError):
        with Stubber(dynamodb) as dynamo_stub, Stubber(sns) as sns_stub:
            dynamo_stub.add_response("transact_write_items", SUCCESS_RESPONSE)
            sns_stub.add_client_error("publish")
            handler(get_event(), None)


def test_dynamodb_update_error_raises_client_error():
    with pytest.raises(ClientError):
        with Stubber(dynamodb) as dynamo_stub:
            dynamo_stub.add_client_error("transact_write_items")
            handler(get_event(), None)
