const assert = require('node:assert/strict');
const { createCommunityGuideRoadmapPersistenceHarness } = require('../../helpers/createCommunityGuideRoadmapPersistenceHarness');

const harness = createCommunityGuideRoadmapPersistenceHarness({
  initial: { 'guild-1': { guideChannelId: 'G', guideMessageId: 'GM', welcome: { keep: true }, unknown: 'keep' } }
});
const result = harness.patch('guild-1', { roadmapChannelId: 'R', roadmapMessageId: 'RM' });
assert.equal(result.persisted, true);
assert.deepEqual(harness.getState()['guild-1'], {
  guideChannelId: 'G', guideMessageId: 'GM', welcome: { keep: true }, unknown: 'keep',
  roadmapChannelId: 'R', roadmapMessageId: 'RM', updatedAt: '2026-07-25T00:00:00.000Z'
});
console.log('Roadmap legacy persistence shallow-merges the existing guild record');
