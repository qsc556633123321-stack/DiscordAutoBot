const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..');
const runtime = fs.readFileSync(path.join(root, 'src', 'systems', 'communityConcierge.js'), 'utf8');
const guideStart = runtime.indexOf('async function setupCommunityGuide');
const guideEnd = runtime.indexOf('async function setupRoadmapPanel');
const welcomeStart = runtime.indexOf('async function sendConciergeWelcome');
const welcomeEnd = runtime.indexOf('\n}\n\nmodule.exports', welcomeStart);
const guide = runtime.slice(guideStart, guideEnd);
const welcome = runtime.slice(welcomeStart, welcomeEnd);

assert.ok(guideStart >= 0 && guideEnd > guideStart, 'Guide runtime boundaries must exist');
for (const forbidden of [
  'readOnboardingData(', 'fromLegacyPublicationRecord', 'data.guideMessageId',
  'channel.messages.fetch', 'message.edit(', 'channel.send(', 'saveOnboarding(',
  'persistCommunityPublicationRecord', '.execute(', 'node:fs', 'fs.', 'repository'
]) {
  assert.equal(guide.includes(forbidden), false, `Guide must not directly own ${forbidden}`);
}
assert.equal((guide.match(/createCommunityPublicationTrackingReadRequest/g) || []).length, 1);
assert.equal((guide.match(/createCommunityPublicationTrackingReadCompatibilityAdapter/g) || []).length, 1);
assert.equal((guide.match(/readTrackedMessage/g) || []).length, 1);
assert.match(guide, /publication: 'guide'/);
assert.equal(guide.includes('lookupPort.lookup('), true);
assert.equal(guide.includes('mutationPort.edit('), true);
assert.equal(guide.includes('mutationPort.send('), true);
assert.equal(guide.includes('createGuidePersistenceRequest('), true);
assert.equal(guide.includes('communityGuidePersistenceFeature.persist('), true);
assert.equal((runtime.match(/readOnboardingData\(\)/g) || []).length, 0, 'dead compatibility reader helper is removed');
assert.equal(welcome.includes('readOnboardingData()'), false);
assert.equal(welcome.includes('guideChannelId'), true);
assert.equal((runtime.match(/function saveOnboarding\(/g) || []).length, 0);

const changedProduction = execFileSync('git', ['status', '--short'], { cwd: root, encoding: 'utf8' })
  .trim().split(/\r?\n/).filter(Boolean).map((line) => line.slice(3).trim())
  .filter((file) => file.startsWith('src/'));
assert.equal(changedProduction.every((file) => [
  'src/systems/communityConcierge.js',
  'src/infrastructure/community/CommunityPublicationTrackingReadCompatibilityAdapter.js',
  'src/infrastructure/community/CommunityPublicationChannelTrackingReadCompatibilityAdapter.js',
  'src/infrastructure/community/CommunityOnboardingStateReader.js',
  'src/infrastructure/community/CommunityOnboardingJsonReader.js',
  'src/infrastructure/community/CommunityOnboardingJsonReaderFactory.js',
  'src/infrastructure/community/CommunityWelcomeChannelResolver.js',
  'src/infrastructure/community/CommunityWelcomeDmDeliveryAdapter.js',
  'src/application/community/CommunityConciergeButtonActionResolver.js',
  'src/application/community/communityRoleQuickActionUseCase.js',
  'src/application/community/ports/CommunityRoleMutationGateway.js',
  'src/composition/communityRoleQuickActionFeature.js',
  'src/infrastructure/discord/communityRoleMutationGateway.js'
].includes(file)), true);

console.log('Guide closure re-audit confirms all Guide read, lookup, mutation, and persistence ownership is boundary-based.');
