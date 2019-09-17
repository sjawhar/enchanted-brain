import boto3
import json
import os
import re
from base64 import b64decode
from botocore.exceptions import ClientError
from decimal import Decimal
from enchanted_brain.attributes import (
    ATTR_AGGREGATE_CHOICE_COUNT,
    ATTR_AGGREGATE_CHOICE_SUM,
    ATTR_CHOICE_VALUE_CHILLS,
    ATTR_CHOICE_VALUE_COLOR,
    ATTR_CHOICE_VALUE_EMOTION,
    ATTR_RECORD_ID,
    CHOICE_CHILLS,
    CHOICE_COLOR,
    CHOICE_EMOTION_ANGER,
    CHOICE_EMOTION_HAPPINESS,
    PREFIX_CHOICE_TYPE_EMOTION,
    RECORD_ID_AGGREGATE,
)

DYNAMODB_TABLE_NAME = os.environ.get("DYNAMODB_TABLE_NAME")
DYNAMODB_ENDPOINT = os.environ.get("DYNAMODB_ENDPOINT")

dynamodb_args = {}
if DYNAMODB_ENDPOINT:
    dynamodb_args["endpoint_url"] = DYNAMODB_ENDPOINT
dynamodb = boto3.resource("dynamodb", **dynamodb_args)
table = dynamodb.Table(DYNAMODB_TABLE_NAME)

CHOICE_TYPE_KEYS = {
    CHOICE_COLOR: ATTR_CHOICE_VALUE_COLOR,
    CHOICE_EMOTION_ANGER: ATTR_CHOICE_VALUE_EMOTION,
    CHOICE_EMOTION_HAPPINESS: ATTR_CHOICE_VALUE_EMOTION,
    CHOICE_CHILLS: ATTR_CHOICE_VALUE_CHILLS,
}

REGEX_NAME_MATCH = re.compile("#[kt]")


def get_db_args(records):
    op_count = None
    db_args = []
    for i in range(len(records)):
        if len(db_args) == 0 or len(args["add"]) == 50:
            db_args.append({"set": [], "add": [], "names": {}, "values": {}})
        args = db_args[-1]
        data = json.loads(
            b64decode(records[i]["data"]).decode("utf-8"), parse_float=Decimal
        )
        names = {
            "t": data["CHOICE_TIME"].replace(" ", "T") + "Z",
            "c": ATTR_AGGREGATE_CHOICE_COUNT,
            "s": ATTR_AGGREGATE_CHOICE_SUM,
        }
        values = {"c": data["CHOICE_COUNT"], "s": data["CHOICE_SUM"]}
        choice_type = data["CHOICE_TYPE"]

        if choice_type.startswith(CHOICE_COLOR):
            color = choice_type.split("_")[2]
            choice_type = CHOICE_COLOR
            names["s"] += f"_{color}"

        elif choice_type.startswith(PREFIX_CHOICE_TYPE_EMOTION):
            emotion = choice_type[7:]
            names["s"] += f"_{emotion}"
            names["c"] += f"_{emotion}"

        names["k"] = CHOICE_TYPE_KEYS[choice_type]

        is_new_set = False
        is_new_add = False
        for p, name in list(names.items()):
            if name in args["names"]:
                names[name] = args["names"][name]
                continue
            if p in ["k", "t"]:
                is_new_set = True
            is_new_add = True
            placeholder = f"#{p}{i}"
            args["names"][name] = placeholder
            names[name] = placeholder

        for p, value in list(values.items()):
            if value in args["values"]:
                values[value] = args["values"][value]
                continue
            is_new_add = True
            placeholder = f":{p}{i}"
            args["values"][value] = placeholder
            values[value] = placeholder

        choice_key = names[names["k"]]
        timestamp = names[names["t"]]
        count_name = names[names["c"]]
        count_value = values[values["c"]]
        sum_name = names[names["s"]]
        sum_value = values[values["s"]]
        if is_new_set:
            args["set"].append(
                f"{choice_key}.{timestamp} = if_not_exists({choice_key}.{timestamp}, :e)"
            )
        if is_new_add:
            args["add"].append(
                f"{choice_key}.{timestamp}.{sum_name} {sum_value}, {choice_key}.{timestamp}.{count_name} {count_value}"
            )

    for args in db_args:
        args["names"] = {v: k for k, v in args["names"].items()}
        args["values"] = {v: k for k, v in args["values"].items()}
    return db_args


def update_aggregate_record(**update_args):
    return table.update_item(
        Key={ATTR_RECORD_ID: RECORD_ID_AGGREGATE}, ReturnValues="NONE", **update_args
    )


def ensure_maps_exist(db_args):
    return update_aggregate_record(
        UpdateExpression="SET " + ", ".join(db_args["set"]),
        ExpressionAttributeNames={
            k: v for k, v in db_args["names"].items() if REGEX_NAME_MATCH.match(k)
        },
        ExpressionAttributeValues={":e": {}},
    )


def add_records_to_aggregate(db_args):
    return update_aggregate_record(
        UpdateExpression="ADD " + ", ".join(db_args["add"]),
        ExpressionAttributeNames=db_args["names"],
        ExpressionAttributeValues=db_args["values"],
    )


def handler(event, context):
    record_results = []
    records = event["records"]
    result = "Ok"
    try:
        for db_args in get_db_args(records):
            ensure_maps_exist(db_args)
            add_records_to_aggregate(db_args)
    except Exception as e:
        print(e)
        result = "DeliveryFailed"

    return {
        "records": [
            {"recordId": record["recordId"], "result": result} for record in records
        ]
    }
