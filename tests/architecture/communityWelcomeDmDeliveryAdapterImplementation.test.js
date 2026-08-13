const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..');
const sourcePath = path.join(root, 'src', 'infrastructure', 'community', 'CommunityWelcomeDmDeliveryAdapter.js');
const source = fs.readFileSync(sourcePath, 'utf8');
const runtime = fs.readFileSync(path.join(root, 'src', 'systems', 'communityConcierge.js'), 'utf8');
const start = runtime.indexOf('async function sendConciergeWelcome');
const end = runtime.indexOf('\n}\n\nmodule.exports', start);
const welcome = runtime.slice(start, end);

assert.equal(source.includes("require('discord.js')"), false);
for (const forbidden of [
  'application/', 'composition/', 'CommunityPublicationChannelTracking',
  'CommunityWelcomeChannelResolver', 'CommunityOnboardingStateReader',
  'node:fs', 'node:path', 'readJson', 'buildCommunityWelcomeMessage',
  'mapLegacyWelcomeDeliveryRequest', 'console.', 'logger'
]) {
  assert.equal(source.includes(forbidden), false, `DM adapter must not depend on ${forbidden}`);
}
assert.equal(source.includes('member.send(payload).catch(() => null)'), true);
assert.equal(welcome.includes('member.send(payload).catch(() => null)'), true);
assert.equal(welcome.includes('createCommunityWelcomeDmDeliveryAdapter'), false);
assert.equal(fs.existsSync(sourcePath), true);
const changedSource = execFileSync('git', ['diff', '--name-only', 'HEAD', '--', 'src'], { cwd: root, encoding: 'utf8' })
  .trim()
  .split(/\r?\n/)
  .filter(Boolean);
assert.deepEqual(changedSource, []);
console.log('Welcome DM adapter is isolated while the runtime remains direct and legacy-compatible.');
