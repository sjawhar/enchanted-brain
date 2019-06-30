from src.functions.choice_writer.index import handler


def test_handler():
    resp = handler({}, None)
    assert resp == {"statusCode": 204}
