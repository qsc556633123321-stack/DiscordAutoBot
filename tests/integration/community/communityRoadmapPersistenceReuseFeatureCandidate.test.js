const assert = require('node:assert/strict');
const { createFakeProductionShapeRoadmapPersistenceFeature } = require('../../fakes/community/FakeProductionShapeRoadmapPersistenceFeature');
const { createRoadmapPublicationPersistenceRequest } = require('../../../src/application/community/roadmapPublication/RoadmapPublicationPersistenceRequest');

const result = { persisted: true, record: { roadmapMessageId: 'M' } };
let input;
const feature = createFakeProductionShapeRoadmapPersistenceFeature({
  communityPublicationStateFeature: {
    persistCommunityPublicationRecord: { execute(value) { input = value; return result; } }
  }
});
const returned = feature.persist(createRoadmapPublicationPersistenceRequest({ guildId: 'G', channelId: 'C', messageId: 'M' }));
assert.deepEqual(input, { guildId: 'G', patch: { roadmapChannelId: 'C', roadmapMessageId: 'M' } });
assert.strictEqual(returned, result);
console.log('Roadmap reuse feature candidate maps once and returns the exact generic result');
