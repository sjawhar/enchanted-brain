import sys, os, base64, datetime, hashlib, hmac, json, requests
from urllib import parse

# this will look like https://gem4rt4c0j.execute-api.us-east-1.amazonaws.com/Prod/@connections
websocket_conections_url = os.environ["API_URL"]

def handler(event, context):

    records = event["Records"]
    for record in records:
        source_arn = record["eventSourceARN"]
        connectionId = source_arn.split("callback-")[-1]
        body = record["body"]


        # ************* REQUEST VALUES *************
        method = "POST"
        service = "execute-api"
        host = "gem4rt4c0j.execute-api.us-east-1.amazonaws.com"
        region = os.environ["AWS_REGION"]
        endpoint = websocket_conections_url + "/" + connectionId
        content_type = "application/x-amz-json-1.0"

        # Request parameters for CreateTable--passed in a JSON block.
        request_parameters = json.dumps(body)

        # Key derivation functions. See:
        # http://docs.aws.amazon.com/general/latest/gr/signature-v4-examples.html#signature-v4-examples-python
        def sign(key, msg):
            return hmac.new(key, msg.encode("utf-8"), hashlib.sha256).digest()

        def getSignatureKey(key, date_stamp, regionName, serviceName):
            kDate = sign(("AWS4" + key).encode("utf-8"), date_stamp)
            kRegion = sign(kDate, regionName)
            kService = sign(kRegion, serviceName)
            kSigning = sign(kService, "aws4_request")
            return kSigning

        # Read AWS access key from env. variables or configuration file. Best practice is NOT
        # to embed credentials in code.
        access_key = os.environ.get("AWS_ACCESS_KEY_ID")
        secret_key = os.environ.get("AWS_SECRET_ACCESS_KEY")
        if access_key is None or secret_key is None:
            print("No access key is available.")
            sys.exit()

        # Create a date for headers and the credential string
        t = datetime.datetime.utcnow()
        amz_date = t.strftime("%Y%m%dT%H%M%SZ")
        date_stamp = t.strftime("%Y%m%d")  # Date w/o time, used in credential scope

        # ************* TASK 1: CREATE A CANONICAL REQUEST *************
        # http://docs.aws.amazon.com/general/latest/gr/sigv4-create-canonical-request.html
        # Step 1 is to define the verb (GET, POST, etc.)--already done.
        # Step 2: Create canonical URI--the part of the URI from domain to query
        # string (use "/" if no path)
        canonical_uri = parse.quote("/Prod/@connections/" + connectionId)

        ## Step 3: Create the canonical query string. In this example, request
        # parameters are passed in the body of the request and the query string
        # is blank.
        canonical_querystring = ""

        # Step 4: Create the canonical headers. Header names must be trimmed
        # and lowercase, and sorted in code point order from low to high.
        # Note that there is a trailing \n.
        canonical_headers = "content-type:" + content_type + "\n" + "host:" + host + "\n" + "x-amz-date:" + amz_date + "\n"

        # Step 5: Create the list of signed headers. This lists the headers
        # in the canonical_headers list, delimited with ";" and in alpha order.
        # Note: The request can include any headers; canonical_headers and
        # signed_headers include those that you want to be included in the
        # hash of the request. "Host" and "x-amz-date" are always required.
        # For DynamoDB, content-type and x-amz-target are also required.
        signed_headers = "content-type;host;x-amz-date"

        # Step 6: Create payload hash. In this example, the payload (body of
        # the request) contains the request parameters.
        payload_hash = hashlib.sha256(request_parameters.encode("utf-8")).hexdigest()

        # Step 7: Combine elements to create canonical request
        canonical_request = method + "\n" + canonical_uri + "\n" + canonical_querystring + "\n" + canonical_headers + "\n" + signed_headers + "\n" + payload_hash

        # ************* TASK 2: CREATE THE STRING TO SIGN*************
        # Match the algorithm to the hashing algorithm you use, either SHA-1 or
        # SHA-256 (recommended)
        algorithm = "AWS4-HMAC-SHA256"
        credential_scope = date_stamp + "/" + region + "/" + service + "/" + "aws4_request"
        string_to_sign = algorithm + "\n" + amz_date + "\n" + credential_scope + "\n" + hashlib.sha256(
            canonical_request.encode("utf-8")).hexdigest()
        # ************* TASK 3: CALCULATE THE SIGNATURE *************
        # Create the signing key using the function defined above.
        signing_key = getSignatureKey(secret_key, date_stamp, region, service)

        # Sign the string_to_sign using the signing_key
        signature = hmac.new(signing_key, (string_to_sign).encode("utf-8"), hashlib.sha256).hexdigest()

        # ************* TASK 4: ADD SIGNING INFORMATION TO THE REQUEST *************
        # Put the signature information in a header named Authorization.
        authorization_header = algorithm + " " + "Credential=" + access_key + "/" + credential_scope + ", " + "SignedHeaders=" + signed_headers + ", " + "Signature=" + signature
        # For DynamoDB, the request can include any headers, but MUST include "host", "x-amz-date",
        # "x-amz-target", "content-type", and "Authorization". Except for the authorization
        # header, the headers must be included in the canonical_headers and signed_headers values, as
        # noted earlier. Order here is not significant.
        # # Python note: The "host" header is added automatically by the Python "requests" library.
        headers = {"Content-Type": content_type,
                   "X-Amz-Date": amz_date,
                   "Authorization": authorization_header}

        r = requests.post(endpoint, data=request_parameters, headers=headers)
        print(r)
    return {"statusCode": 204}


"""
POST shape:
POST https://{api-id}.execute-api.us-east-1.amazonaws.com/{stage}/@connections/{connection_id}
SQS event shape:
{
    "Records": [
        {
            "messageId": "059f36b4-87a3-44ab-83d2-661975830a7d",
            "receiptHandle": "AQEBwJnKyrHigUMZj6rYigCgxlaS3SLy0a...",
            "body": {"field: "value"},
            "attributes": {
                "ApproximateReceiveCount": "1",
                "SentTimestamp": "1545082649183",
                "SenderId": "AIDAIENQZJOLO23YVJ4VO",
                "ApproximateFirstReceiveTimestamp": "1545082649185"
            },
            "messageAttributes": {},
            "md5OfBody": "098f6bcd4621d373cade4e832627b4f6",
            "eventSource": "aws:sqs",
            "eventSourceARN": "arn:aws:sqs:us-east-2:123456789012:my-queue",
            "awsRegion": "us-east-2"
        },
        ...
    ]
}
"""
