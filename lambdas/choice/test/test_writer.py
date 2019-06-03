from src.writer import handler


def test_handler():
    resp = handler({}, None)
    assert resp == {"statusCode": 204}
