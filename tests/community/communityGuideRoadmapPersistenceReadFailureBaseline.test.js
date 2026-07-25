const assert = require('node:assert/strict');
const fixture = require('../fixtures/communityGuideRoadmapPersistenceLegacyBaseline');
const { createCommunityGuideRoadmapPersistenceHarness } = require('../helpers/createCommunityGuideRoadmapPersistenceHarness');

for (const raw of [fixture.records.emptyFile, fixture.records.malformed, '[]', 'null']) {
  const harness = createCommunityGuideRoadmapPersistenceHarness({ raw });
  assert.deepEqual(harness.read(), {});
}
const missing = createCommunityGuideRoadmapPersistenceHarness();
assert.deepEqual(missing.read(), {});
const denied = createCommunityGuideRoadmapPersistenceHarness({ readFails: true });
assert.throws(() => denied.read(), /read failure/);
console.log('Community Guide/Roadmap persistence read-failure baseline tests passed.');
