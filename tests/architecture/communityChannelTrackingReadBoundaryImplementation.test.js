const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..');
const portPath = path.join(root, 'src', 'application', 'community', 'ports', 'CommunityPublicationChannelTrackingReadPort.js');
const adapterPath = path.join(root, 'src', 'infrastructure', 'community', 'CommunityPublicationChannelTrackingReadCompatibilityAdapter.js');
const messagePortPath = path.join(root, 'src', 'application', 'community', 'ports', 'CommunityPublicationTrackingReadPort.js');
const messageAdapterPath = path.join(root, 'src', 'infrastructure', 'community', 'CommunityPublicationTrackingReadCompatibilityAdapter.js');
const runtime = fs.readFileSync(path.join(root, 'src', 'systems', 'communityConcierge.js'), 'utf8');
const port = fs.readFileSync(portPath, 'utf8');
const adapter = fs.readFileSync(adapterPath, 'utf8');
const welcome = runtime.match(/async function sendConciergeWelcome\(member\) \{([\s\S]*?)\n\}\n\nmodule\.exports/)[1];

assert.equal(fs.existsSync(portPath), true);
assert.equal(fs.existsSync(adapterPath), true);
assert.equal(fs.existsSync(path.join(root, 'src', 'composition', 'communityPublicationChannelTrackingReadFeature.js')), false);
assert.equal(port.includes('discord.js'), false);
for (const forbidden of ['node:fs', 'infrastructure', 'communityConcierge', 'saveOnboarding', 'persist', 'writeFile']) {
  assert.equal(port.includes(forbidden), false, `Port must not depend on ${forbidden}`);
}
for (const forbidden of ['discord.js', 'communityConcierge', 'saveOnboarding', 'persist', 'writeFile', 'updatedAt', 'fromLegacyPublicationRecord']) {
  assert.equal(adapter.includes(forbidden), false, `Adapter must not depend on ${forbidden}`);
}
assert.equal(adapter.includes('readOnboardingData'), false);
assert.equal((adapter.match(/onboardingStateReader\.readOnboardingState\(\)/g) || []).length, 1);
assert.equal(adapter.includes('guideMessageId'), false);
assert.equal(adapter.includes('roadmapMessageId'), false);
assert.equal(fs.readFileSync(messagePortPath, 'utf8').includes('readTrackedChannel'), false);
assert.equal(fs.readFileSync(messageAdapterPath, 'utf8').includes('readTrackedChannel'), false);
assert.equal(welcome.includes('readOnboardingData()'), false);
assert.equal(welcome.includes('data.guideChannelId'), false);
assert.equal(welcome.includes('readTrackedChannel'), true);
assert.equal(welcome.includes('createCommunityPublicationChannelTrackingReadRequest'), true);
assert.equal(welcome.includes('createCommunityPublicationChannelTrackingReadCompatibilityAdapter'), true);
assert.equal((runtime.match(/readOnboardingData\(\)/g) || []).length, 0, 'dead compatibility reader helper is removed');
assert.equal((runtime.match(/function saveOnboarding\(/g) || []).length, 0);
const changedProduction = execFileSync('git', ['status', '--short'], { cwd: root, encoding: 'utf8' })
  .trim().split(/\r?\n/).filter(Boolean).map((line) => line.slice(3).trim())
  .filter((file) => file.startsWith('src/'));
assert.equal(changedProduction.every((file) => [
  'src/systems/communityConcierge.js',
  'src/infrastructure/community/CommunityPublicationTrackingReadCompatibilityAdapter.js',
  'src/infrastructure/community/CommunityPublicationChannelTrackingReadCompatibilityAdapter.js',
  'src/infrastructure/community/CommunityOnboardingStateReader.js'
].includes(file)), true);
console.log('Channel tracking read boundary is pure, isolated, uncomposed, and runtime-active for Welcome.');
