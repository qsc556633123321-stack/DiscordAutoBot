const assert = require('node:assert/strict');
const { createCommunityRoadmapFeature } = require('../../src/composition/communityRoadmapFeature');
const { createFakeCommunityRoadmapGateway } = require('../fixtures/communityRoadmapFakes');

const gateway = createFakeCommunityRoadmapGateway({
  roadmap: { completed: ['Done'], inProgress: [], future: [] }
});
const feature = createCommunityRoadmapFeature({ gateway });
const result = feature.getCommunityRoadmap.execute();

assert.equal(result.ok, true);
assert.equal(result.data.roadmap.sections[0].items[0], 'Done');
assert.equal(gateway.calls.length, 1);
assert.deepEqual(Object.keys(feature), ['getCommunityRoadmap']);
console.log('Community Roadmap composition tests passed.');
