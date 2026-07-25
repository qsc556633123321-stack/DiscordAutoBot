const assert = require('node:assert/strict');
const fixture = require('../fixtures/communityGuideRoadmapPersistenceLegacyBaseline');
const { createCommunityGuideRoadmapPersistenceHarness } = require('../helpers/createCommunityGuideRoadmapPersistenceHarness');

const failing = createCommunityGuideRoadmapPersistenceHarness({ initial: fixture.records.guideOnly, writeFails: true });
const failed = failing.patch('guild-1', fixture.patches.guide);
assert.equal(failed.persisted, false);
assert.equal(failing.getState()['guild-1'].guideMessageId, 'guide-message');
assert.deepEqual(failing.log.calls, ['read', 'write']);
const successful = createCommunityGuideRoadmapPersistenceHarness({ initial: fixture.records.guideOnly });
assert.equal(successful.patch('guild-1', fixture.patches.guide).persisted, true);
assert.match(successful.getContent(), /\n$/);
assert.equal(successful.log.writes.length, 1);
console.log('Community Guide/Roadmap persistence write-failure baseline tests passed.');
