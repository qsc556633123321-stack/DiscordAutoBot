const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..', '..');
const runtime = fs.readFileSync(path.join(root, 'src/systems/communityConcierge.js'), 'utf8');
const candidate = fs.readFileSync(path.join(root, 'tests/fakes/community/FakeCommunityChannelSetupBoundaryCandidate.js'), 'utf8');
const adapterPath = path.join(root, 'src/infrastructure/community/CommunityChannelSetupCompatibilityAdapter.js');
const adapter = fs.readFileSync(adapterPath, 'utf8');
assert.equal(fs.existsSync(adapterPath), true);
for (const token of ['getOrCreateCategory', 'getOrCreateGuideChannel', 'getOrCreateRoadmapChannel', 'guild.channels.create', 'permissionOverwrites.set', 'channel.setParent']) assert.equal(runtime.includes(token), false);
assert.match(runtime, /createCommunityChannelSetupCompatibilityAdapter/);
for (const token of ['ensureCategory', 'ensureGuideChannel', 'ensureRoadmapChannel', 'guild\.channels\.create', 'channel\.setParent']) {
  assert.match(adapter, new RegExp(token));
}
assert.match(adapter, /permissionOverwrites\s*\.set/);
for (const forbidden of ['interaction.', 'createCommunityRoleQuickActionFeature', 'node:fs', 'createCommunityPublicationStateFeature', 'console.']) assert.equal(candidate.includes(forbidden), false);
assert.match(candidate, /catch\(\(\) => null\)/);
assert.match(runtime, /buildCommunityRoleConciergePresentationPayload/);
assert.match(runtime, /buildCommunityNonRoleConciergePresentationPayload/);
console.log('Community channel setup preparation remains covered after the approved Infrastructure redirect.');
