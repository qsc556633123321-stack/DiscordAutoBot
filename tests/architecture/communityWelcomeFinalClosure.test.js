const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..');
const runtime = fs.readFileSync(path.join(root, 'src', 'systems', 'communityConcierge.js'), 'utf8');
const start = runtime.indexOf('async function sendConciergeWelcome');
const end = runtime.indexOf('\n}\n\nmodule.exports', start);
const welcome = runtime.slice(start, end);

assert.ok(start >= 0 && end > start);
for (const forbidden of [
  'member.send(', 'channels.cache.get', 'channels.fetch',
  'findChannelByName(member.guild, GUIDE_CHANNEL_NAME)', 'readOnboardingData',
  'data.guideChannelId', 'fromLegacyPublicationRecord', 'readJson(', 'ensureFile(',
  'fs.', 'writeFile', 'readFile', 'client.users', 'guild.members.fetch'
]) {
  assert.equal(welcome.includes(forbidden), false, `Welcome must not directly own ${forbidden}`);
}
for (const required of [
  'createCommunityOnboardingStateReader', 'readTrackedChannel',
  'createCommunityWelcomeChannelResolver', 'channelResolver.resolve',
  'mapLegacyWelcomeDeliveryRequest', 'buildCommunityWelcomeMessage',
  'createCommunityWelcomeDmDeliveryAdapter', 'await dmDelivery.send(payload)'
]) {
  assert.equal(welcome.includes(required), true, `Welcome must retain ${required}`);
}
assert.equal((welcome.match(/readTrackedChannel/g) || []).length, 1);
assert.equal((welcome.match(/createCommunityWelcomeChannelResolver/g) || []).length, 1);
assert.equal((welcome.match(/channelResolver\.resolve/g) || []).length, 1);
assert.equal((welcome.match(/createCommunityWelcomeDmDeliveryAdapter/g) || []).length, 1);
assert.equal((welcome.match(/dmDelivery\.send\(payload\)/g) || []).length, 1);
assert.equal(welcome.indexOf('readTrackedChannel') < welcome.indexOf('channelResolver.resolve'), true);
assert.equal(welcome.indexOf('channelResolver.resolve') < welcome.indexOf('if (!guideChannel) return'), true);
assert.equal(welcome.indexOf('if (!guideChannel) return') < welcome.indexOf('mapLegacyWelcomeDeliveryRequest'), true);
assert.equal(welcome.indexOf('buildCommunityWelcomeMessage') < welcome.indexOf('createCommunityWelcomeDmDeliveryAdapter'), true);
assert.equal(welcome.indexOf('createCommunityWelcomeDmDeliveryAdapter') < welcome.indexOf('await dmDelivery.send(payload)'), true);
assert.deepEqual(
  execFileSync('git', ['diff', '--name-only', 'HEAD', '--', 'src'], { cwd: root, encoding: 'utf8' }).trim().split(/\r?\n/).filter(Boolean),
  ['src/infrastructure/community/CommunityOnboardingStateReader.js', 'src/systems/communityConcierge.js']
);
console.log('Welcome final closure has no direct tracking, resolution, or DM delivery ownership.');
