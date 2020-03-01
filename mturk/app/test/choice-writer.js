import test from 'ava';
import sinon from 'sinon';
import aws from 'aws-sdk';

const TEST_APP_SECRET = 'test-app-secret';
const TEST_APP_SECRET_ARN = 'arn:aws:test:secrets/test-app-secret';
const TEST_S3_BUCKET = 'test-s3-bucket';
const CHOICE_VALID = {
  songPosition: 20000,
  choice: 1,
};

const stubber = method => {
  function ServiceMock() {}
  const stub = sinon.stub().resolves();
  ServiceMock.prototype[method] = (...args) => {
    const promise = stub(...args);
    return { promise: () => promise };
  };
  return [ServiceMock, stub];
};
const [S3, putObject] = stubber('putObject');
const [SecretsManager, getSecretValue] = stubber('getSecretValue');
Object.assign(aws, { S3, SecretsManager });

let handler;

const getEvent = ({
  age = 45,
  authorization = TEST_APP_SECRET,
  body,
  choiceInverted = true,
  choices = [CHOICE_VALID],
  choiceType = 'CHOICE_TYPE_TEST',
  colorPerception = 1,
  countryOfBirth = 'CH',
  countryOfResidence = 'CH',
  gender = 'GENDER_MALE',
  id = '026dd787-1c8d-423c-9ded-942ad1a9c371',
  interval = 20,
  songId = 'SONG_TEST_2',
  timeout = 5,
}) => ({
  headers: authorization === false ? {} : { Authorization: `Bearer ${authorization}` },
  body:
    body === false
      ? undefined
      : JSON.stringify({
        choiceInverted,
        choiceType,
        choices,
        demographics: {
          age,
          colorPerception,
          countryOfBirth,
          countryOfResidence,
          gender,
        },
        id,
        interval,
        songId,
        timeout,
      }),
});

const macroErrorResponse = async (t, context, {
  statusCode, error = {}, message, event,
}) => {
  const expectedStatus = statusCode || error.statusCode || 500;
  const expectedMessage = message || error.message;
  const handlerEvent = event || getEvent(Object.assign(t.context, context));

  const response = await handler(handlerEvent);

  const { errorMessage } = JSON.parse(response.body || '{}');
  t.true(errorMessage.includes(expectedMessage), errorMessage);
  t.is(response.statusCode, expectedStatus);
};

test.before(() => {
  Object.assign(process.env, {
    ENCHANTED_BRAIN_APP_SECRET_ARN: TEST_APP_SECRET_ARN,
    ENCHANTED_BRAIN_S3_BUCKET_NAME: TEST_S3_BUCKET,
    ENCHANTED_BRAIN_VALID_CHOICE_TYPES: 'CHOICE_TYPE_TEST,CHOICE_TYPE_TEST_TWO',
    ENCHANTED_BRAIN_VALID_SONG_IDS: 'SONG_TEST_1,SONG_TEST_2',
  });
  getSecretValue.resolves({ SecretString: TEST_APP_SECRET });
  ({ handler } = require('../src/functions/choice-writer')); // eslint-disable-line global-require
});

test('Choice writer exports a handler function', t => {
  t.true(handler instanceof Function);
});
test('SecretsManager.getSecretValue() is called with expected arguments', async t => {
  const event = getEvent({});

  await handler(event);

  t.true(getSecretValue.calledWithExactly({ SecretId: TEST_APP_SECRET_ARN }));
});

test(
  'If the request has no Authorization header, returns 401',
  macroErrorResponse,
  { authorization: false },
  { statusCode: 401, message: 'Unauthorized' },
);
test(
  'If the request Authoriztion header is not the app secret, returns 401',
  macroErrorResponse,
  { authorization: 'not-app-secret' },
  { statusCode: 401, message: 'Unauthorized' },
);
test(
  'If the request body is empty, returns 400',
  macroErrorResponse,
  { body: false },
  { statusCode: 400, message: 'body must not be empty' },
);

test(
  'If id is not a UUID, returns 422',
  macroErrorResponse,
  { id: 'not-a-uuid' },
  { statusCode: 422, message: 'not-a-uuid' },
);
test(
  'If songId is not among the valid values, returns 422',
  macroErrorResponse,
  { songId: 'SONG_UNKNOWN' },
  { statusCode: 422, message: 'songId' },
);
test(
  'If choiceType is not among the valid types, returns 422',
  macroErrorResponse,
  { choiceType: 'CHOICE_TYPE_MYSTERY' },
  { statusCode: 422, message: 'choiceType' },
);
test(
  'If choiceInverted is not boolean, returns 422',
  macroErrorResponse,
  { choiceInverted: 'true' },
  { statusCode: 422, message: 'choiceInverted' },
);
test(
  'If interval is not an integer, returns 422',
  macroErrorResponse,
  { interval: '20' },
  { statusCode: 422, message: 'interval' },
);
test(
  'If timeout is not an integer, returns 422',
  macroErrorResponse,
  { timeout: '5' },
  { statusCode: 422, message: 'timeout' },
);
test(
  'If demographics.age is not an integer, returns 422',
  macroErrorResponse,
  { age: '45' },
  { statusCode: 422, message: 'age' },
);
test(
  'If demographics.colorPerception is not an integer between 0 and 4, returns 422',
  macroErrorResponse,
  { colorPerception: 5 },
  { statusCode: 422, message: 'colorPerception' },
);
test(
  'If demographics.gender is not a valid value, returns 422',
  macroErrorResponse,
  { gender: 'GENDER_ZEBRA' },
  { statusCode: 422, message: 'gender' },
);
test(
  'If demographics.countryOfBirth is not an uppercase two-letter String, returns 422',
  macroErrorResponse,
  { countryOfBirth: 'ch' },
  { statusCode: 422, message: 'countryOfBirth' },
);
test(
  'If demographics.countryOfResidence is not an uppercase two-letter String, returns 422',
  macroErrorResponse,
  { countryOfResidence: 'ch' },
  { statusCode: 422, message: 'countryOfResidence' },
);
test(
  'If choices is not a non-empty Array, returns 422',
  macroErrorResponse,
  { choices: [] },
  { statusCode: 422, message: 'choices must be a non-empty array' },
);
test(
  'If choices[].songPosition is not a positive integer, returns 422',
  macroErrorResponse,
  { choices: [CHOICE_VALID, { ...CHOICE_VALID, songPosition: -3 }] },
  { statusCode: 422, message: 'songPosition' },
);
test(
  'If choices[].choice attribute is not an integer between -2 and 2, returns 422',
  macroErrorResponse,
  { choices: [{ ...CHOICE_VALID, choice: -3 }, CHOICE_VALID] },
  { statusCode: 422, message: '-3' },
);

test('If all checks pass, file is saved to S3 in expected location', async t => {
  const choiceType = 'CHOICE_TYPE_TEST_TWO';
  const id = 'ada0d7bc-f569-49bc-9a81-dd3eda2b11c1';
  const songId = 'SONG_TEST_1';
  const event = getEvent({
    choiceType,
    id,
    songId,
  });

  await handler(event);

  t.true(
    putObject.calledWithExactly({
      Body: event.body,
      Bucket: TEST_S3_BUCKET,
      Key: `Choices/${songId}/${choiceType}/${id}.json`,
      ContentMD5: '4a9MCVI6UqidpWpWkwR+tw==',
      ContentType: 'application/json',
    }),
    JSON.stringify(putObject.args, null, 2),
  );
});

test('If s3 saving fails, returns 500', async t => {
  const event = getEvent({ id: '851f9f89-27d2-403d-a3b4-ad97b3b78a98' });
  const error = new Error('S3 fail rejection');
  putObject.withArgs(sinon.match({ Body: event.body })).rejects(error);

  return macroErrorResponse(t, {}, { event, error });
});

test('On success, returns 204', async t => {
  const event = getEvent(t.context);

  const result = await handler(event);

  t.deepEqual(result, { statusCode: 204 });
});
