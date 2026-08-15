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
assert.equal(welcome.includes('member.send(payload).catch(() => null)'), false);
assert.equal(welcome.includes('createCommunityWelcomeDmDeliveryAdapter'), true);
assert.equal(welcome.includes('await dmDelivery.send(payload)'), true);
assert.equal(execFileSync('git', ['diff', '--name-only', 'HEAD', '--', resolverPath], { cwd: root, encoding: 'utf8' }).trim(), '');
const changedSource = execFileSync('git', ['status', '--short'], { cwd: root, encoding: 'utf8' })
  .trim().split(/\r?\n/).filter(Boolean).map((line) => line.slice(3).trim()).filter((file) => file.startsWith('src/'));
const allowedSource = new Set([
  'src/systems/communityConcierge.js',
  'src/infrastructure/community/CommunityOnboardingStateReader.js',
  'src/infrastructure/community/CommunityWelcomeDmDeliveryAdapter.js',
  'src/infrastructure/community/CommunityOnboardingJsonReader.js',
  'src/infrastructure/community/CommunityOnboardingJsonReaderFactory.js',
  'src/application/community/CommunityConciergeButtonActionResolver.js',
  'src/application/community/communityRoleQuickActionUseCase.js',
  'src/application/community/ports/CommunityRoleMutationGateway.js',
  'src/composition/communityRoleQuickActionFeature.js',
  'src/infrastructure/discord/communityRoleMutationGateway.js',
  'src/modules/community/CommunityNonRoleConciergePresentation.js',
  'src/modules/interactions/buttonHandlers/communityConciergeButtons.js',
  'src/modules/interactions/buttonInteractionHandler.js',
  'src/legacy/interactions/legacyInteractionRuntime.js'
]);
assert.equal(
  changedSource.every((file) => allowedSource.has(file)),
  true,
  'Welcome infrastructure follow-up slices may modify only approved Welcome source files'
);
console.log('Welcome runtime uses one per-invocation channel resolver and delegates DM delivery to its adapter.');
