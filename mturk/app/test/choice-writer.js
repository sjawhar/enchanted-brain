import test from 'ava';

let handler;

test.before(() => {
  ({ handler } = require('../src/functions/choice-writer')); // eslint-disable-line global-require
});

test('Choice writer exports a handler function', t => {
  t.true(handler instanceof Function);
});
