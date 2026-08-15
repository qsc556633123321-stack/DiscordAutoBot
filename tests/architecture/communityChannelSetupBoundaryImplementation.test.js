const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..');
const runtime = fs.readFileSync(path.join(root, 'src/systems/communityConcierge.js'), 'utf8');
const adapterPath = path.join(root, 'src/infrastructure/community/CommunityChannelSetupCompatibilityAdapter.js');
const adapter = fs.readFileSync(adapterPath, 'utf8');

assert.equal(fs.existsSync(adapterPath), true);
assert.match(adapter, /require\(['"]discord\.js['"]\)/);
assert.equal(adapter.includes("require('../../config/permissionTemplates')"), false);
assert.match(adapter, /onboardingVisible\(guild\)/);
for (const forbidden of ['node:fs', 'writeFile', 'saveOnboarding', 'persist', 'createCommunityPublicationStateFeature', 'setTimeout', 'console.', 'delete(']) {
  assert.equal(adapter.includes(forbidden), false, `adapter must not own ${forbidden}`);
}
for (const runtimeMutation of ['guild.channels.create', 'channel.setParent', 'permissionOverwrites.set']) {
  assert.equal(runtime.includes(runtimeMutation), false, `runtime must not own ${runtimeMutation}`);
}
assert.match(adapter, /ensureGuideChannel/);
assert.match(adapter, /ensureRoadmapChannel/);
assert.match(adapter, /channel\.parentId !== category\.id/);
assert.match(adapter, /Keep guide channel onboarding visible/);
const roadmapBody = adapter.slice(adapter.indexOf('async function ensureRoadmapChannel'), adapter.indexOf('return Object.freeze'));
assert.equal(roadmapBody.includes('setParent'), false);
assert.equal(roadmapBody.includes('permissionOverwrites'), false);
assert.match(runtime, /createCommunityGuideAdapterPairFeature/);
assert.match(runtime, /createCommunityRoadmapAdapterPairFeature/);
assert.match(runtime, /sendConciergeWelcome/);
console.log('Community channel setup mutation is Infrastructure-owned; publication, persistence, and Welcome runtime remain isolated.');
