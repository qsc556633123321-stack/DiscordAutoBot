const assert = require('node:assert/strict');
const { createCommunityGuideRoadmapPersistenceHarness } = require('../../helpers/createCommunityGuideRoadmapPersistenceHarness');
const { createFakeProductionShapeRoadmapPersistenceFeature } = require('../../fakes/community/FakeProductionShapeRoadmapPersistenceFeature');
const { createRoadmapPublicationPersistenceRequest } = require('../../../src/application/community/roadmapPublication/RoadmapPublicationPersistenceRequest');

const harness = createCommunityGuideRoadmapPersistenceHarness({ initial: { 'guild-1': { guideMessageId: 'GM', unknown: true } } });
const candidate = createFakeProductionShapeRoadmapPersistenceFeature({
  communityPublicationStateFeature: { persistCommunityPublicationRecord: { execute(input) { return harness.patch(input.guildId, input.patch); } } }
});
candidate.persist(createRoadmapPublicationPersistenceRequest({ guildId: 'guild-1', channelId: 'RC', messageId: 'RM' }));
const record = harness.getState()['guild-1'];
assert.equal(record.guideMessageId, 'GM');
assert.equal(record.roadmapChannelId, 'RC');
assert.equal(record.unknown, true);
assert.ok(record.updatedAt);
console.log('Roadmap reuse feature candidate preserves Guide coexistence through generic persistence');
