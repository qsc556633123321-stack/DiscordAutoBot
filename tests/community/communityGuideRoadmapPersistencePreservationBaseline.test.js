const assert = require('node:assert/strict');
const fixture = require('../fixtures/communityGuideRoadmapPersistenceLegacyBaseline');
const { createCommunityGuideRoadmapPersistenceHarness } = require('../helpers/createCommunityGuideRoadmapPersistenceHarness');

const initial = { ...fixture.records.mixed, 'guild-other': { retained: true } };
const harness = createCommunityGuideRoadmapPersistenceHarness({ initial });
harness.patch('guild-1', fixture.patches.guide);
let state = harness.getState();
assert.equal(state['guild-1'].roadmapMessageId, 'roadmap-message');
assert.deepEqual(state['guild-1'].unknown, { preserve: true });
assert.deepEqual(state['guild-other'], { retained: true });
harness.patch('guild-1', fixture.patches.roadmap);
state = harness.getState();
assert.equal(state['guild-1'].guideMessageId, 'guide-next-message');
assert.deepEqual(state['guild-1'].unknown, { preserve: true });
assert.equal(Object.hasOwn(state['guild-1'], 'optionalMissing'), false);
console.log('Community Guide/Roadmap persistence preservation baseline tests passed.');
