const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const runtimePath = path.resolve(__dirname, '..', '..', 'src', 'systems', 'communityConcierge.js');
const source = fs.readFileSync(runtimePath, 'utf8');
const start = source.indexOf('async function setupCommunityGuide');
const end = source.indexOf('async function setupRoadmapPanel');
const guideRuntime = source.slice(start, end);

assert.ok(start >= 0 && end > start, 'Guide runtime boundaries must exist');
for (const forbidden of ['channel.messages.fetch', 'message.edit(', 'channel.send(', 'saveOnboarding(', 'persistCommunityPublicationRecord', 'fs.writeFile', 'repository']) {
  assert.equal(guideRuntime.includes(forbidden), false, `Guide runtime must not directly use ${forbidden}`);
}
assert.equal(guideRuntime.includes('lookupPort.lookup('), true);
assert.equal(guideRuntime.includes('mutationPort.edit('), true);
assert.equal(guideRuntime.includes('mutationPort.send('), true);
assert.equal(guideRuntime.includes('createGuidePersistenceRequest('), true);
assert.equal(guideRuntime.includes('communityGuidePersistenceFeature.persist('), true);
assert.equal((guideRuntime.match(/readOnboardingData\(\)/g) || []).length, 1);
assert.equal((source.match(/function saveOnboarding\(/g) || []).length, 1);

console.log('Guide final legacy search classifies ports as allowed and the tracked state read as shared.');
