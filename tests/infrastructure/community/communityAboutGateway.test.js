const assert = require('node:assert/strict');
const { createCommunityAboutGateway } = require('../../../src/infrastructure/community/communityAboutGateway');

const gateway = createCommunityAboutGateway();

assert.deepEqual(gateway.getCommunityAboutFacts({ guildName: 'Test Guild' }), { guildName: 'Test Guild' });
assert.deepEqual(gateway.getCommunityAboutFacts({ guildName: '' }), { guildName: '' });
assert.throws(() => createCommunityAboutGateway({ factsReader: () => { throw new Error('source failed'); } }).getCommunityAboutFacts({ guildName: 'Test Guild' }), /source failed/);
console.log('Community About gateway tests passed.');
