const assert = require('node:assert/strict');
const { createFakeProductionShapeRoadmapPersistenceFeature } = require('../../fakes/community/FakeProductionShapeRoadmapPersistenceFeature');
const { createRoadmapPublicationPersistenceRequest } = require('../../../src/application/community/roadmapPublication/RoadmapPublicationPersistenceRequest');

const result = { persisted: true, record: {} };
const candidate = createFakeProductionShapeRoadmapPersistenceFeature({
  communityPublicationStateFeature: { persistCommunityPublicationRecord: { execute() { return result; } } }
});
const returned = candidate.persist(createRoadmapPublicationPersistenceRequest({ guildId: 'G', channelId: 'C', messageId: 'M' }));
assert.strictEqual(returned, result);
assert.equal(typeof returned?.then, 'undefined');
console.log('Roadmap reuse feature candidate remains synchronous');
