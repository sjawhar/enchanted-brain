import test from 'ava';

let handler;

const getEvent = () => ({});

test.before(() => {
  ({ handler } = require('../src/functions/choice-writer')); // eslint-disable-line global-require
});

test('Choice writer exports a handler function', t => {
  t.true(handler instanceof Function);
});

test.todo('If the request has no Authoriztion header, returns 401');
test.todo('If the request Authoriztion header is not the app secret, returns 401');
test.todo('If the request body is empty, returns 400');

test.todo('If id is not a UUID, returns 422');
test.todo('If songId is not among the valid values, returns 422');
test.todo('If choiceType is not among the valid types, returns 422');
test.todo('If choiceInverted is not boolean, returns 422');
test.todo('If interval is not an integer, returns 422');
test.todo('If timeout is not an integer, returns 422');
test.todo('If demographics.age is not an integer, returns 422');
test.todo('If demographics.colorPerception is not an integer between 0 and 4, returns 422');
test.todo('If demographics.gender is not a valid value, returns 422');
test.todo('If demographics.countryOfBirth is not a two-letter String, returns 422');
test.todo('If demographics.countryOfResidence is not a two-letter String, returns 422');
test.todo('If choices is not a non-empty Array, returns 422');
test.todo('If choices[].timestamp is not a date, returns 422');
test.todo('If choices[].choice attribute is not an integer between -2 and 2, returns 422');

test.todo('If all checks pass, file is saved to S3 in expected location');
test.todo('If s3 saving fails, returns 500');
test('On success, returns 204', async t => {
  const event = getEvent(t.context);

  const result = await handler(event);

  t.deepEqual(result, { statusCode: 204 });
});
