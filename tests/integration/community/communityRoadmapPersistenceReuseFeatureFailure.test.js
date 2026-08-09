const assert = require('node:assert/strict');
const { createFakeProductionShapeRoadmapPersistenceFeature } = require('../../fakes/community/FakeProductionShapeRoadmapPersistenceFeature');
const { createRoadmapPublicationPersistenceRequest } = require('../../../src/application/community/roadmapPublication/RoadmapPublicationPersistenceRequest');

const writeFailure = { persisted: false, record: { roadmapMessageId: 'M' } };
const candidate = createFakeProductionShapeRoadmapPersistenceFeature({
  communityPublicationStateFeature: { persistCommunityPublicationRecord: { execute() { return writeFailure; } } }
});
assert.strictEqual(candidate.persist(createRoadmapPublicationPersistenceRequest({ guildId: 'G', channelId: 'C', messageId: 'M' })), writeFailure);

const invariant = new Error('guildId is required');
const throwing = createFakeProductionShapeRoadmapPersistenceFeature({
  communityPublicationStateFeature: { persistCommunityPublicationRecord: { execute() { throw invariant; } } }
});
assert.throws(() => throwing.persist(createRoadmapPublicationPersistenceRequest({ guildId: '', channelId: 'C', messageId: 'M' })), (error) => error === invariant);
console.log('Roadmap reuse feature candidate preserves writer results and propagates generic invariant throws');
