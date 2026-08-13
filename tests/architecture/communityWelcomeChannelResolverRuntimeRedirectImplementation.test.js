const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..');
const runtimePath = path.join(root, 'src', 'systems', 'communityConcierge.js');
const resolverPath = path.join(root, 'src', 'infrastructure', 'community', 'CommunityWelcomeChannelResolver.js');
const runtime = fs.readFileSync(runtimePath, 'utf8');
const start = runtime.indexOf('async function sendConciergeWelcome');
const end = runtime.indexOf('\n}\n\nmodule.exports', start);
const welcome = runtime.slice(start, end);

assert.ok(start >= 0 && end > start);
assert.equal((welcome.match(/createCommunityWelcomeChannelResolver/g) || []).length, 1);
assert.equal((welcome.match(/channelResolver\.resolve/g) || []).length, 1);
assert.equal((welcome.match(/readTrackedChannel/g) || []).length, 1);
assert.equal(welcome.indexOf('readTrackedChannel') < welcome.indexOf('createCommunityWelcomeChannelResolver'), true);
assert.equal(welcome.indexOf('createCommunityWelcomeChannelResolver') < welcome.indexOf('channelResolver.resolve'), true);
assert.equal(welcome.indexOf('channelResolver.resolve') < welcome.indexOf('if (!guideChannel) return'), true);
assert.match(welcome, /trackedChannelId: guideChannelId/);
assert.match(welcome, /fallbackChannelName: GUIDE_CHANNEL_NAME/);
for (const forbidden of ['channels.cache.get', 'channels.fetch', 'findChannelByName(member.guild, GUIDE_CHANNEL_NAME)']) {
  assert.equal(welcome.includes(forbidden), false, `Welcome runtime must not directly own ${forbidden}`);
}
assert.equal(welcome.includes('findChannelByName });'), true);
assert.equal(welcome.includes('member.send(payload).catch(() => null)'), true);
assert.equal(execFileSync('git', ['diff', '--name-only', 'HEAD', '--', resolverPath], { cwd: root, encoding: 'utf8' }).trim(), '');
const changedSource = execFileSync('git', ['status', '--short'], { cwd: root, encoding: 'utf8' })
  .trim().split(/\r?\n/).filter(Boolean).map((line) => line.slice(3).trim()).filter((file) => file.startsWith('src/'));
assert.equal(
  changedSource.length === 0 || (changedSource.length === 1 && changedSource[0] === 'src/systems/communityConcierge.js'),
  true,
  'Runtime redirect implementation may be clean or modify only communityConcierge.js'
);
console.log('Welcome runtime uses one per-invocation channel resolver and retains only DM delivery directly.');
