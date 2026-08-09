const assert = require('node:assert/strict');
const fixture = require('../../fixtures/community/community-guide-persistence-migration-cases.json');
const { createGuidePersistenceRequest, mapGuidePersistenceRequestToLegacyPatch } = require('../../fakes/community/FakeGuidePersistenceRequestCandidate');
const { createCommunityGuideRoadmapPersistenceHarness } = require('../../helpers/createCommunityGuideRoadmapPersistenceHarness');

const request = createGuidePersistenceRequest({
  guildId: 'guild-1', channelId: 'guide-next', messageId: 'guide-next-message',
  nativeTaskRecommendations: ['entry', 'roles'], nativeTaskExcludedChannels: ['voice', 'roadmap']
});
const patch = mapGuidePersistenceRequestToLegacyPatch(request);
assert.deepEqual(patch, {
  guideChannelId: 'guide-next', guideMessageId: 'guide-next-message',
  nativeTaskRecommendations: ['entry', 'roles'], nativeTaskExcludedChannels: ['voice', 'roadmap']
});
assert.equal(Object.isFrozen(request), true);
assert.equal(Object.isFrozen(patch), true);
const harness = createCommunityGuideRoadmapPersistenceHarness({
  initial: {
    'guild-1': { roadmapMessageId: 'R', welcome: { keep: true }, unknown: 'keep' },
    'other-guild': { guideMessageId: 'other' }
  }
});
const result = harness.patch(request.guildId, patch);
assert.equal(result.persisted, true);
assert.equal(harness.log.calls.join(','), 'read,write');
assert.equal(harness.getState()['guild-1'].guideChannelId, 'guide-next');
assert.equal(harness.getState()['guild-1'].roadmapMessageId, 'R');
assert.deepEqual(harness.getState()['guild-1'].welcome, { keep: true });
assert.equal(harness.getState()['guild-1'].unknown, 'keep');
assert.deepEqual(harness.getState()['other-guild'], { guideMessageId: 'other' });
const failingHarness = createCommunityGuideRoadmapPersistenceHarness({
  initial: { 'guild-1': { guideMessageId: 'old' } },
  writeFails: true
});
const failed = failingHarness.patch(request.guildId, patch);
assert.equal(failed.persisted, false);
assert.equal(failingHarness.log.calls.join(','), 'read,write');
assert.equal(failingHarness.getState()['guild-1'].guideMessageId, 'old');
assert.equal(fixture.cases.length >= 50, true);
assert.equal(fixture.cases.every((item) => typeof item.id === 'string' && typeof item.kind === 'string'), true);
console.log('Guide future-shaped test candidate maps to the exact legacy patch and generic merge contract.');
