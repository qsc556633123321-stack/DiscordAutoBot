const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..');
const runtimePath = path.join(root, 'src', 'systems', 'communityConcierge.js');
const resolverPath = path.join(root, 'src', 'infrastructure', 'community', 'CommunityWelcomeChannelResolver.js');
const runtime = fs.readFileSync(runtimePath, 'utf8');
const candidate = fs.readFileSync(path.join(root, 'tests', 'fakes', 'community', 'FakeCommunityWelcomeChannelResolverRuntimeRedirect.js'), 'utf8');
const start = runtime.indexOf('async function sendConciergeWelcome');
const end = runtime.indexOf('\n}\n\nmodule.exports', start);
const welcome = runtime.slice(start, end);

assert.ok(start >= 0 && end > start);
assert.equal(welcome.includes('channels.cache.get'), false);
assert.equal(welcome.includes('channels.fetch'), false);
assert.equal(welcome.includes('findChannelByName(member.guild, GUIDE_CHANNEL_NAME)'), false);
assert.equal(welcome.includes('createCommunityWelcomeChannelResolver'), true);
assert.equal(welcome.includes('channelResolver.resolve'), true);
assert.equal(welcome.includes('member.send(payload).catch(() => null)'), true);
assert.equal(candidate.includes('createCommunityWelcomeChannelResolver'), true);
assert.equal(candidate.includes('createCommunityPublicationChannelTrackingReadCompatibilityAdapter'), true);
assert.equal(candidate.includes('member.send(payload).catch(() => null)'), true);
for (const forbidden of ['function createCommunityWelcomeChannelResolver', 'readOnboardingData', 'readJson', 'ONBOARDING_FILE']) {
  assert.equal(candidate.includes(forbidden), false, `Candidate must not own ${forbidden}`);
}
assert.equal(execFileSync('git', ['diff', '--name-only', 'HEAD', '--', resolverPath], { cwd: root, encoding: 'utf8' }).trim(), '');
const changedSource = execFileSync('git', ['status', '--short'], { cwd: root, encoding: 'utf8' })
  .trim().split(/\r?\n/).filter(Boolean).map((line) => line.slice(3).trim()).filter((file) => file.startsWith('src/'));
const allowedSource = new Set([
  'src/systems/communityConcierge.js',
  'src/infrastructure/community/CommunityWelcomeDmDeliveryAdapter.js'
]);
assert.equal(
  changedSource.every((file) => allowedSource.has(file)),
  true,
  'Welcome infrastructure follow-up slices may modify only approved Welcome source files'
);
console.log('Welcome resolver redirect preserves the resolver, tracking, filesystem, and DM boundaries.');
