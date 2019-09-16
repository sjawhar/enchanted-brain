from src.functions.pre_signup.index import handler


def test_pre_signup_autoconfirms_user():
    event = {
        "request": {"userAttributes": {"phone_number": "+12065550100"}},
        "response": {},
    }
    resp = None
    resp = handler(event, None)
    assert resp["response"]["autoConfirmUser"] == True
