const assert = require('node:assert/strict');
const { createGetCommunityAboutUseCase } = require('../../../src/application/community/getCommunityAboutUseCase');
const { createFakeCommunityAboutGateway } = require('../../fixtures/communityAboutFakes');

assert.throws(() => createGetCommunityAboutUseCase(), /gateway is required/);

const gateway = createFakeCommunityAboutGateway();
const useCase = createGetCommunityAboutUseCase({ gateway });
const result = useCase.execute({ guildName: 'Test Guild' });
assert.equal(result.ok, true);
assert.deepEqual(gateway.calls, [{ guildName: 'Test Guild' }]);
assert.equal(result.data.about.embed.fields[1].value, 'Test Guild');

const empty = createGetCommunityAboutUseCase({ gateway: { getCommunityAboutFacts: () => ({}) } }).execute({ guildName: 'Test Guild' });
assert.equal(empty.ok, false);
assert.equal(empty.error.code, 'COMMUNITY_ABOUT_QUERY_FAILED');

const failed = createGetCommunityAboutUseCase({ gateway: { getCommunityAboutFacts: () => { throw new Error('gateway failed'); } } }).execute({ guildName: 'Test Guild' });
assert.equal(failed.ok, false);
assert.equal(failed.error.message, 'gateway failed');
console.log('Community About application tests passed.');
