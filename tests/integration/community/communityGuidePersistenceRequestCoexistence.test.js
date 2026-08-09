const assert = require('node:assert/strict');
const { createGuidePersistenceRequest, mapGuidePersistenceRequestToGenericInput } = require('../../../src/application/community/guidePublication/GuidePersistenceRequest');
const { createCommunityGuideRoadmapPersistenceHarness } = require('../../helpers/createCommunityGuideRoadmapPersistenceHarness');

const harness = createCommunityGuideRoadmapPersistenceHarness({
  initial: {
    'guild-1': { roadmapChannelId: 'R-C', roadmapMessageId: 'R-M', welcome: { keep: true }, unknown: 'keep' },
    'other-guild': { guideMessageId: 'other' }
  }
});
const input = mapGuidePersistenceRequestToGenericInput(createGuidePersistenceRequest({
  guildId: 'guild-1', channelId: 'G-C', messageId: 'G-M',
  nativeTaskRecommendations: ['entry'], nativeTaskExcludedChannels: ['voice']
}));
const result = harness.patch(input.guildId, input.patch);
assert.equal(result.persisted, true);
assert.equal(harness.getState()['guild-1'].roadmapChannelId, 'R-C');
assert.equal(harness.getState()['guild-1'].roadmapMessageId, 'R-M');
assert.deepEqual(harness.getState()['guild-1'].welcome, { keep: true });
assert.equal(harness.getState()['guild-1'].unknown, 'keep');
assert.deepEqual(harness.getState()['other-guild'], { guideMessageId: 'other' });
console.log('Guide request generic input preserves Roadmap, welcome, unknown, and other-guild fields.');
