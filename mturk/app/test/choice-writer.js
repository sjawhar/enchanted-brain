import test from 'ava';

const TEST_APP_SECRET = 'test-app-secret';
const CHOICE_VALID = {
  timestamp: new Date().toISOString(),
  choice: 1,
};

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
  headers: authorization === false ? {} : { Authorization: authorization },
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
  process.env.ENCHANTED_BRAIN_APP_SECRET = TEST_APP_SECRET;
  process.env.ENCHANTED_BRAIN_VALID_CHOICE_TYPES = 'CHOICE_TYPE_TEST,CHOICE_TYPE_TEST_TWO';
  process.env.ENCHANTED_BRAIN_VALID_SONG_IDS = 'SONG_TEST_1,SONG_TEST_2';
  ({ handler } = require('../src/functions/choice-writer')); // eslint-disable-line global-require
});

test('Choice writer exports a handler function', t => {
  t.true(handler instanceof Function);
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
  'If choices[].timestamp is not a date, returns 422',
  macroErrorResponse,
  { choices: [CHOICE_VALID, { ...CHOICE_VALID, timestamp: 'invalid' }] },
  { statusCode: 422, message: 'timestamp' },
);
test(
  'If choices[].choice attribute is not an integer between -2 and 2, returns 422',
  macroErrorResponse,
  { choices: [{ ...CHOICE_VALID, choice: -3 }, CHOICE_VALID] },
  { statusCode: 422, message: '-3' },
);

test.todo('If all checks pass, file is saved to S3 in expected location');
test.todo('If s3 saving fails, returns 500');
test('On success, returns 204', async t => {
  const event = getEvent(t.context);

  const result = await handler(event);

  t.deepEqual(result, { statusCode: 204 });
});
