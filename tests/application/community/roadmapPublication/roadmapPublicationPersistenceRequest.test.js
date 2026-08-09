const assert = require('node:assert/strict');
const {
  createRoadmapPublicationPersistenceRequest,
  mapRoadmapPublicationPersistenceRequestToGenericInput
} = require('../../../../src/application/community/roadmapPublication/RoadmapPublicationPersistenceRequest');

const nested = { exact: true };
const request = createRoadmapPublicationPersistenceRequest({ guildId: 'G', channelId: nested, messageId: 'M' });
assert.deepEqual(Object.keys(request), ['guildId', 'channelId', 'messageId']);
assert.equal(Object.isFrozen(request), true);
assert.strictEqual(request.channelId, nested);

for (const value of ['', 0, false, null, undefined, nested]) {
  const raw = createRoadmapPublicationPersistenceRequest({ guildId: value, channelId: value, messageId: value });
  assert.strictEqual(raw.guildId, value);
  assert.strictEqual(raw.channelId, value);
  assert.strictEqual(raw.messageId, value);
  const mapped = mapRoadmapPublicationPersistenceRequestToGenericInput(raw);
  assert.strictEqual(mapped.guildId, value);
  assert.strictEqual(mapped.patch.roadmapChannelId, value);
  assert.strictEqual(mapped.patch.roadmapMessageId, value);
}

assert.deepEqual(
  mapRoadmapPublicationPersistenceRequestToGenericInput(
    createRoadmapPublicationPersistenceRequest({ guildId: 'G', channelId: 'C', messageId: 'M' })
  ),
  { guildId: 'G', patch: { roadmapChannelId: 'C', roadmapMessageId: 'M' } }
);
console.log('Roadmap publication persistence request and mapper preserve exact scalar inputs');
