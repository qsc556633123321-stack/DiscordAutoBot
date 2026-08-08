const assert = require('node:assert/strict');
const cases = require('../fixtures/community/community-guide-mutation-runtime-integration-preparation-cases.json');

for (const item of cases) {
  const shouldFetch = Boolean(item.trackedMessageId) && item.mode !== 'force';
  const legacyOperation = item.mode !== 'force' && shouldFetch && item.fetch === 'message'
    ? 'EditExistingMessage'
    : 'SendNewMessage';
  assert.equal(legacyOperation, item.operation, item.id);
}
console.log('community Guide mutation Plan branch runtime pre-integration baseline passed');
