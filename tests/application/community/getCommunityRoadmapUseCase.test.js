const assert = require('node:assert/strict');
const { createGetCommunityRoadmapUseCase } = require('../../../src/application/community/getCommunityRoadmapUseCase');
const { createFakeCommunityRoadmapGateway } = require('../../fixtures/communityRoadmapFakes');

assert.throws(() => createGetCommunityRoadmapUseCase(), /gateway is required/);

const gateway = createFakeCommunityRoadmapGateway({
  roadmap: { completed: ['Done'], inProgress: ['Now'], future: ['Later'] }
});
const result = createGetCommunityRoadmapUseCase({ gateway }).execute();
assert.equal(result.ok, true);
assert.equal(gateway.calls.length, 1);
assert.equal(result.data.roadmap.sections[0].items[0], 'Done');

const malformed = createGetCommunityRoadmapUseCase({
  gateway: createFakeCommunityRoadmapGateway({ roadmap: {} })
}).execute();
assert.equal(malformed.ok, false);
assert.equal(malformed.error.code, 'COMMUNITY_ROADMAP_QUERY_FAILED');

const failed = createGetCommunityRoadmapUseCase({
  gateway: createFakeCommunityRoadmapGateway({ error: new Error('reader failed') })
}).execute();
assert.equal(failed.ok, false);
assert.equal(failed.error.message, 'reader failed');
console.log('Community Roadmap application tests passed.');
