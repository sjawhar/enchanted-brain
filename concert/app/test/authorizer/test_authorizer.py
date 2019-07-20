import json
import os
import pytest
import time
from . import TEST_KEY
from jose import jwt, jwk
from src.functions.authorizer.index import handler

API_ARN = os.environ.get("API_ARN")


@pytest.fixture
def make_event():
    def _make_event(
        authorization="jwt",
        groups=[],
        is_expired=None,
        is_kid_match=True,
        is_signature_valid=True,
        user_id="test-user",
    ):
        event = {"headers": {"Authorization": None}}
        if authorization is None:
            return event

        token = jwt.encode(
            {
                "sub": user_id,
                "exp": time.time() + 3600 * (-1 if is_expired else 1),
                "cognito:groups": groups,
            },
            jwk.construct(TEST_KEY).to_pem(),
            algorithm=TEST_KEY["alg"],
            headers={"kid": TEST_KEY["kid"] if is_kid_match else "nope"},
        )
        if not is_signature_valid:
            token += "nope"
        event["headers"]["Authorization"] = token
        return event

    return _make_event


def verify_policy(policy, principalId):
    assert type(policy) is dict
    assert policy["principalId"] == principalId
    assert type(policy["policyDocument"]) is dict
    policy_doc = policy["policyDocument"]
    assert policy_doc["Version"] == "2012-10-17"
    assert type(policy_doc["Statement"]) is list
    assert len(policy_doc["Statement"]) == 1
    statement = policy_doc["Statement"][0]
    assert statement["Effect"] in ["Allow", "Deny"]
    assert statement["Action"] == "execute-api:Invoke"
    assert type(statement["Resource"]) in [list, str]
    resources = statement["Resource"]
    if type(resources) is str:
        resources = [resources]
    for resource in resources:
        assert resource == "*" or resource.startswith(API_ARN + "/")


@pytest.mark.parametrize(
    "authorization, is_expired, is_kid_match, is_signature_valid",
    [
        (None, False, True, True),
        ("jwt", True, True, True),
        ("jwt", False, False, True),
        ("jwt", False, True, False),
    ],
)
def test_all_methods_denied(
    authorization, is_expired, is_kid_match, is_signature_valid, make_event
):
    event = make_event(
        authorization=authorization,
        is_expired=is_expired,
        is_kid_match=is_kid_match,
        is_signature_valid=is_signature_valid,
    )
    policy = handler(event, {})
    verify_policy(policy, "Unauthorized")
    statements = policy["policyDocument"]["Statement"]
    assert statements[0]["Effect"] == "Deny"
    assert statements[0]["Resource"] == "*"


@pytest.mark.parametrize(
    "user_id, groups, method",
    [
        ("audience-user", [], "CHOICE_MADE"),
        ("admin-user", ["Admin"], "EVENT_STAGE_CHANGED"),
        ("visualization-user", ["Visualization"], None),
    ],
)
def test_methods_allowed(user_id, groups, method, make_event):
    event = make_event(user_id=user_id, groups=groups)
    policy = handler(event, {})
    verify_policy(policy, user_id)
    statements = policy["policyDocument"]["Statement"]
    assert statements[0]["Effect"] == "Allow"
    assert type(statements[0]["Resource"]) is list
    methods = ["$connect", "$disconnect"]
    if method is not None:
        methods.append(method)
    for meth in methods:
        assert "{}/{}".format(API_ARN, meth) in statements[0]["Resource"]


def test_audience_user_has_context(make_event):
    event = make_event()
    policy = handler(event, {})
    assert "context" in policy
    assert type(policy["context"]["choiceType"]) is str
    assert type(policy["context"]["choiceInverted"]) is bool
