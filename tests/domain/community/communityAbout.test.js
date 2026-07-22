const assert = require('node:assert/strict');
const { createCommunityAboutModel } = require('../../../src/domain/community/communityAbout');

const source = { guildName: 'Test Guild' };

const about = createCommunityAboutModel(source);
assert.equal(about.embed.fields[1].value, 'Test Guild');
assert.equal(about.embed.fields[0].name, '你可以從哪裡開始');
assert.equal(about.embed.fields[2].name, '核心方向');
assert.throws(() => createCommunityAboutModel(), /must include a guild name/);
assert.throws(() => createCommunityAboutModel({}), /must include a guild name/);
console.log('Community About domain tests passed.');
