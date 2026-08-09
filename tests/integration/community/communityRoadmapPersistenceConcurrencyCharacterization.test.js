const assert = require('node:assert/strict');
const { createCommunityGuideRoadmapPersistenceHarness } = require('../../helpers/createCommunityGuideRoadmapPersistenceHarness');

const sameGuild = createCommunityGuideRoadmapPersistenceHarness({ initial: { 'guild-1': { guideMessageId: 'GM' } } });
sameGuild.patch('guild-1', { roadmapMessageId: 'M1' });
sameGuild.patch('guild-1', { roadmapMessageId: 'M2' });
assert.equal(sameGuild.getState()['guild-1'].roadmapMessageId, 'M2');
assert.equal(sameGuild.getState()['guild-1'].guideMessageId, 'GM');
const differentGuild = createCommunityGuideRoadmapPersistenceHarness({ initial: {} });
differentGuild.patch('guild-1', { roadmapMessageId: 'M1' });
differentGuild.patch('guild-2', { roadmapMessageId: 'M2' });
assert.equal(differentGuild.getState()['guild-1'].roadmapMessageId, 'M1');
assert.equal(differentGuild.getState()['guild-2'].roadmapMessageId, 'M2');
console.log('Roadmap persistence concurrency characterization records sequential last-write behavior only');
