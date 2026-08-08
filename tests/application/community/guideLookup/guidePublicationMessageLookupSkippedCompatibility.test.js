const assert = require('node:assert/strict');
const { createLookupSkipped } = require('../../../../src/application/community/guideLookup/GuidePublicationMessageLookupResult');
const { GuidePublicationMessageLookupStatus } = require('../../../../src/application/community/guideLookup/GuidePublicationMessageLookupStatus');

for (const messageId of ['m', 1, { legacy: true }, undefined]) {
  const result = createLookupSkipped({ messageId });
  assert.equal(result.status, GuidePublicationMessageLookupStatus.LookupSkipped);
  assert.strictEqual(result.messageId, messageId);
}
console.log('Guide publication message lookup skipped compatibility passed');
