const assert = require('node:assert/strict');
const cases = require('../fixtures/community/community-guide-runtime-persistence-redirect-cases.json');

assert.ok(cases.length >= 50);
for (const name of [
  'edit-success', 'send-success', 'four-field-atomic', 'single-persist', 'single-execute',
  'persisted-false', 'result-ignore', 'invariant-undefined', 'sync', 'no-retry',
  'no-rollback', 'read-after-write', 'saveOnboarding-last-consumer', 'production-diff-zero'
]) assert.ok(cases.includes(name), `Missing frozen redirect case: ${name}`);
console.log('Guide runtime persistence redirect fixture inventory is complete.');
