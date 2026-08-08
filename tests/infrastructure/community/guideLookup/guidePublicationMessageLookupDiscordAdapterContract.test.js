const assert = require('node:assert/strict');
const path = require('node:path');
const cases = require(path.resolve(__dirname, '../../../fixtures/community/community-guide-message-lookup-adapter-cases.json'));
const { createGuidePublicationMessageLookupRequest } = require('../../../../src/application/community/guideLookup/GuidePublicationMessageLookupRequest');
const { createMessageAvailable, createMessageUnavailable } = require('../../../../src/application/community/guideLookup/GuidePublicationMessageLookupResult');

function modelCandidate(resources, request) {
  const channel = resources.resolveChannel({ guildId: request.guildId, channelId: request.channelId });
  const message = resources.fetchMessage(request.messageId);
  return message ? createMessageAvailable({ messageId: request.messageId }) : createMessageUnavailable({ messageId: request.messageId });
}

assert.equal(cases.length, 40);
const opaque = { legacy: true };
const calls = [];
const result = modelCandidate({
  resolveChannel(input) { calls.push(['channel', input]); return { messages: true }; },
  fetchMessage(id) { calls.push(['message', id]); return { id: 'discord-message-id' }; }
}, createGuidePublicationMessageLookupRequest({ guildId: 'g', channelId: 'c', messageId: opaque }));
assert.equal(result.status, 'MessageAvailable');
assert.strictEqual(result.messageId, opaque);
assert.deepEqual(calls, [['channel', { guildId: 'g', channelId: 'c' }], ['message', opaque]]);
assert.equal('message' in result, false);
assert.equal('error' in result, false);
console.log('Guide message lookup Discord adapter contract characterization passed');
