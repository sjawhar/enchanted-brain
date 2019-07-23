import decimal
from json import JSONEncoder


class DynamoDbEncoder(JSONEncoder):
    def default(self, o):
        if not isinstance(o, decimal.Decimal):
            return super(DynamoDbEncoder, self).default(o)
        if o % 1 > 0:
            return float(o)
        return int(o)
