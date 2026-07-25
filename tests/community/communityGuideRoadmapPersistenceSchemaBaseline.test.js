const assert = require('node:assert/strict');
const fixture = require('../fixtures/communityGuideRoadmapPersistenceLegacyBaseline');
const { createCommunityGuideRoadmapPersistenceHarness } = require('../helpers/createCommunityGuideRoadmapPersistenceHarness');

const harness = createCommunityGuideRoadmapPersistenceHarness({ initial: fixture.records.mixed });
const record = harness.read()['guild-1'];
assert.equal(fixture.filePath, 'src/data/onboarding-flows.json');
assert.equal(typeof harness.read(), 'object');
for (const field of ['guideChannelId', 'guideMessageId', 'roadmapChannelId', 'roadmapMessageId']) assert.equal(typeof record[field], 'string');
assert.equal(Array.isArray(record.nativeTaskRecommendations), true);
assert.equal(record.unknown.preserve, true);
assert.equal(Object.hasOwn(record, 'version'), false);
assert.equal(Object.hasOwn(record, 'metadata'), false);
console.log('Community Guide/Roadmap persistence schema baseline tests passed.');
