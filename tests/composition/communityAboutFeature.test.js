const assert = require('node:assert/strict');
const { createCommunityAboutFeature } = require('../../src/composition/communityAboutFeature');
const { createFakeCommunityAboutGateway, createFakeLogger } = require('../fixtures/communityAboutFakes');

const gateway = createFakeCommunityAboutGateway();
const logger = createFakeLogger();
const feature = createCommunityAboutFeature({ gateway, logger });

const result = feature.getCommunityAbout.execute({ guildName: 'Composition Guild' });
assert.equal(result.ok, true);
assert.deepEqual(gateway.calls, [{ guildName: 'Composition Guild' }]);
assert.equal(result.data.about.embed.fields[1].value, 'Test Guild');
assert.deepEqual(logger.entries, []);
assert.equal(Object.keys(feature).join(','), 'getCommunityAbout');
console.log('Community About composition tests passed.');
