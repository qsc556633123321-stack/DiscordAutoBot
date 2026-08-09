const assert = require('node:assert/strict');
const {
  createFakeRoadmapPublicationPersistenceRequest,
  mapFakeRoadmapPublicationPersistenceRequestToGenericInput
} = require('../../fakes/community/FakeRoadmapPublicationPersistenceRequest');

const variants = ['', 0, false, null, undefined, { raw: true }];
for (const value of variants) {
  const request = createFakeRoadmapPublicationPersistenceRequest({ guildId: value, channelId: value, messageId: value });
  assert.strictEqual(request.guildId, value);
  assert.strictEqual(request.channelId, value);
  assert.strictEqual(request.messageId, value);
  assert.equal(Object.isFrozen(request), true);
}

const request = createFakeRoadmapPublicationPersistenceRequest({ guildId: 'G', channelId: 'C', messageId: 'M' });
assert.deepEqual(mapFakeRoadmapPublicationPersistenceRequestToGenericInput(request), {
  guildId: 'G', patch: { roadmapChannelId: 'C', roadmapMessageId: 'M' }
});
console.log('Roadmap persistence request candidate preserves exact scalars and maps only at the generic boundary');
