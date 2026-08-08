const assert = require('node:assert/strict');
const path = require('node:path');
const cases = require(path.resolve(__dirname, '../../../fixtures/community/community-guide-pre-plan-message-lookup-cases.json'));
const { createGuidePublicationMessageLookupRequest } = require('../../../../src/application/community/guideLookup/GuidePublicationMessageLookupRequest');
const { createMessageUnavailable } = require('../../../../src/application/community/guideLookup/GuidePublicationMessageLookupResult');

for (const item of cases.filter((entry) => ['PL-10', 'PL-11', 'PL-12', 'PL-13', 'PL-26', 'PL-29'].includes(entry.id))) {
  const request = createGuidePublicationMessageLookupRequest({ guildId: 'g', channelId: 'c', messageId: item.trackedId });
  const result = createMessageUnavailable({ messageId: request.messageId });
  assert.strictEqual(request.messageId, item.trackedId, item.id);
  assert.strictEqual(result.messageId, item.trackedId, item.id);
}
console.log('Guide publication message lookup malformed identity compatibility passed');
