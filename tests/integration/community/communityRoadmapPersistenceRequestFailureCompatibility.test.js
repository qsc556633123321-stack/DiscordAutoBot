const assert = require('node:assert/strict');
const { createCommunityGuideRoadmapPersistenceHarness } = require('../../helpers/createCommunityGuideRoadmapPersistenceHarness');
const {
  createFakeRoadmapPublicationPersistenceRequest,
  mapFakeRoadmapPublicationPersistenceRequestToGenericInput
} = require('../../fakes/community/FakeRoadmapPublicationPersistenceRequest');

const harness = createCommunityGuideRoadmapPersistenceHarness({ initial: { 'guild-1': { guideMessageId: 'GM' } }, writeFails: true });
const input = mapFakeRoadmapPublicationPersistenceRequestToGenericInput(
  createFakeRoadmapPublicationPersistenceRequest({ guildId: 'guild-1', channelId: 'RC', messageId: 'RM' })
);
const result = harness.patch(input.guildId, input.patch);
assert.equal(result.persisted, false);
assert.equal(result.record.roadmapMessageId, 'RM');
assert.equal(harness.log.writes.length, 1);
console.log('Roadmap request candidate preserves writer failure result semantics for a caller that ignores it');
