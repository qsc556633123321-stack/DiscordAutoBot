const assert = require('node:assert/strict');
const { createCommunityGuideRoadmapPersistenceHarness } = require('../../helpers/createCommunityGuideRoadmapPersistenceHarness');

const harness = createCommunityGuideRoadmapPersistenceHarness({
  initial: {
    'guild-1': { guideChannelId: 'G', guideMessageId: 'GM', nativeTaskRecommendations: ['entry'] },
    'guild-2': { roadmapChannelId: 'other-channel', unknown: { keep: true } }
  }
});
harness.patch('guild-1', { roadmapChannelId: 'C', roadmapMessageId: 'M' });
assert.equal(harness.getState()['guild-1'].guideMessageId, 'GM');
assert.deepEqual(harness.getState()['guild-2'], { roadmapChannelId: 'other-channel', unknown: { keep: true } });
console.log('Roadmap legacy persistence preserves cross-field and cross-guild state');
