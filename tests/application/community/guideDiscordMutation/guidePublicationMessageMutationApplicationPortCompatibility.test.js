const assert = require('node:assert/strict');
const path = require('node:path');
const cases = require(path.resolve(__dirname, '../../../fixtures/community/community-guide-discord-mutation-port-cases.json'));
const { createGuidePublicationMessageEditRequest } = require('../../../../src/application/community/guideDiscordMutation/GuidePublicationMessageEditRequest');
const { createGuidePublicationMessageSendRequest } = require('../../../../src/application/community/guideDiscordMutation/GuidePublicationMessageSendRequest');

assert.equal(cases.length, 30);
for (const item of cases) {
  const payload = { caseId: item.id };
  const request = item.operation === 'edit'
    ? createGuidePublicationMessageEditRequest({ guildId: 'g', channelId: 'c', messageId: 'm', payload })
    : createGuidePublicationMessageSendRequest({ guildId: 'g', channelId: 'c', payload });
  assert.equal(request.payload, payload, item.id);
  assert.equal('operation' in request, false, item.id);
  assert.equal('channel' in request, false, item.id);
}
console.log('Guide publication message mutation Application port compatibility passed');
