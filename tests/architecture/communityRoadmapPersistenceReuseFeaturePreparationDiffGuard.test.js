const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../../src');
for (const relativePath of [
  'application/community/roadmapPublication/RoadmapPublicationPersistenceFeature.js',
  'infrastructure/community/roadmapPublicationStateFilesystemAdapter.js'
]) {
  assert.equal(fs.existsSync(path.join(root, relativePath)), false);
}
const runtime = fs.readFileSync(path.join(root, 'systems/communityConcierge.js'), 'utf8');
const roadmap = runtime.match(/async function setupRoadmapPanel\(guild\) \{([\s\S]*?)\n\}\n\nasync function handleConciergeButton/)[1];
assert.match(roadmap, /communityRoadmapPersistenceFeature\.persist\(persistenceRequest\)/);
assert.doesNotMatch(roadmap, /saveOnboarding\(guild\.id, \{\s+roadmapChannelId/);
console.log('Roadmap reuse feature preparation remains compatible with the runtime redirect');
