const assert = require('node:assert/strict');
const { createCommunityGuideRoadmapPersistenceHarness } = require('../../helpers/createCommunityGuideRoadmapPersistenceHarness');

const harness = createCommunityGuideRoadmapPersistenceHarness({ initial: { 'guild-1': { welcomeChannelId: 'WC' } } });
harness.patch('guild-1', { guideChannelId: 'GC', guideMessageId: 'GM' });
harness.patch('guild-1', { roadmapChannelId: 'RC', roadmapMessageId: 'RM' });
const record = harness.getState()['guild-1'];
assert.deepEqual(
  { guideChannelId: record.guideChannelId, guideMessageId: record.guideMessageId, roadmapChannelId: record.roadmapChannelId, roadmapMessageId: record.roadmapMessageId, welcomeChannelId: record.welcomeChannelId },
  { guideChannelId: 'GC', guideMessageId: 'GM', roadmapChannelId: 'RC', roadmapMessageId: 'RM', welcomeChannelId: 'WC' }
);
console.log('Guide and Roadmap sequential writes coexist through the generic shallow-merge contract');
