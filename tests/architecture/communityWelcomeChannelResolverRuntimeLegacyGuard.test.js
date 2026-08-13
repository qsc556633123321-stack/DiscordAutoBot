const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..');
const runtime = fs.readFileSync(path.join(root, 'src', 'systems', 'communityConcierge.js'), 'utf8');
const start = runtime.indexOf('async function sendConciergeWelcome');
const end = runtime.indexOf('module.exports');
const welcome = runtime.slice(start, end);
for (const forbidden of ['channels.cache.get', 'channels.fetch', 'findChannelByName(member.guild, GUIDE_CHANNEL_NAME)']) {
  assert.equal(welcome.includes(forbidden), false, `Welcome Runtime no longer owns ${forbidden}`);
}
assert.equal(welcome.includes('createCommunityWelcomeChannelResolver'), true);
assert.equal(welcome.includes('channelResolver.resolve'), true);
assert.equal(welcome.includes('member.send(payload).catch(() => null)'), true);
console.log('Welcome Runtime delegates channel resolution while retaining direct DM delivery.');
