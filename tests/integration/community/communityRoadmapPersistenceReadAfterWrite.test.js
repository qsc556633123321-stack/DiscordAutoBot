const assert = require('node:assert/strict');
const { createCommunityGuideRoadmapPersistenceHarness } = require('../../helpers/createCommunityGuideRoadmapPersistenceHarness');

const harness = createCommunityGuideRoadmapPersistenceHarness({ initial: { 'guild-1': { unknown: true } } });
harness.patch('guild-1', { roadmapChannelId: 'C', roadmapMessageId: 'M' });
assert.deepEqual(harness.read()['guild-1'], {
  unknown: true, roadmapChannelId: 'C', roadmapMessageId: 'M', updatedAt: '2026-07-25T00:00:00.000Z'
});
assert.deepEqual(harness.log.calls, ['read', 'write', 'read']);
console.log('Roadmap legacy persistence reads its synchronously written root on the next read');
