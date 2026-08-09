const assert = require('node:assert/strict');
const { createCommunityGuideRoadmapPersistenceHarness } = require('../../helpers/createCommunityGuideRoadmapPersistenceHarness');
const {
  createFakeRoadmapPublicationPersistenceRequest,
  mapFakeRoadmapPublicationPersistenceRequestToGenericInput
} = require('../../fakes/community/FakeRoadmapPublicationPersistenceRequest');

const harness = createCommunityGuideRoadmapPersistenceHarness({
  initial: {
    'guild-1': { guideChannelId: 'GC', guideMessageId: 'GM', welcome: true, native: ['entry'], unknown: 1 },
    'guild-2': { untouched: true }
  }
});
const input = mapFakeRoadmapPublicationPersistenceRequestToGenericInput(
  createFakeRoadmapPublicationPersistenceRequest({ guildId: 'guild-1', channelId: 'RC', messageId: 'RM' })
);
const result = harness.patch(input.guildId, input.patch);
assert.equal(result.persisted, true);
assert.equal(harness.getState()['guild-1'].roadmapChannelId, 'RC');
assert.equal(harness.getState()['guild-1'].roadmapMessageId, 'RM');
assert.equal(harness.getState()['guild-1'].guideMessageId, 'GM');
assert.equal(harness.getState()['guild-1'].unknown, 1);
assert.equal(harness.getState()['guild-2'].untouched, true);
assert.ok(harness.getState()['guild-1'].updatedAt);
console.log('Roadmap request candidate maps compatibly to the generic shallow-merge writer input');
