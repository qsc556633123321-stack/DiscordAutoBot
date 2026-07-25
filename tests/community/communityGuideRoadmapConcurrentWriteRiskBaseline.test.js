const assert = require('node:assert/strict');
const fixture = require('../fixtures/communityGuideRoadmapPersistenceLegacyBaseline');
const { createCommunityGuideRoadmapPersistenceHarness } = require('../helpers/createCommunityGuideRoadmapPersistenceHarness');

const harness = createCommunityGuideRoadmapPersistenceHarness({ initial: fixture.records.mixed });
const staleA = harness.read();
const staleB = harness.read();
staleA['guild-1'].guideMessageId = 'first';
staleB['guild-1'].roadmapMessageId = 'second';
assert.equal(staleA['guild-1'].roadmapMessageId, 'roadmap-message');
assert.equal(staleB['guild-1'].guideMessageId, 'guide-message');
assert.equal(Object.is(staleA, staleB), false, 'separate reads may produce stale competing snapshots');
console.log('Community Guide/Roadmap concurrent-write risk baseline tests passed.');
