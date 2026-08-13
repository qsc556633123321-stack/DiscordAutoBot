const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..');
const runtime = fs.readFileSync(path.join(root, 'src', 'systems', 'communityConcierge.js'), 'utf8');
const start = runtime.indexOf('async function sendConciergeWelcome');
const end = runtime.indexOf('module.exports');
const welcome = runtime.slice(start, end);
for (const required of ['channels.cache.get', 'channels.fetch', 'findChannelByName', 'member.send(payload).catch(() => null)']) {
  assert.equal(welcome.includes(required), true, `Welcome Runtime retains ${required}`);
}
assert.equal(welcome.includes('CommunityWelcomeChannelResolver'), false);
assert.equal(welcome.includes('.resolve('), false);
console.log('Welcome Runtime remains legacy-owned for channel resolution and DM delivery.');
