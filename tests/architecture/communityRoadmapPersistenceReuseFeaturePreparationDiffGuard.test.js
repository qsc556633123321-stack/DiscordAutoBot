const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../../src');
for (const relativePath of [
  'application/community/roadmapPublication/RoadmapPublicationPersistenceFeature.js',
  'composition/communityRoadmapPersistenceFeature.js',
  'infrastructure/community/roadmapPublicationStateFilesystemAdapter.js'
]) {
  assert.equal(fs.existsSync(path.join(root, relativePath)), false);
}
const runtime = fs.readFileSync(path.join(root, 'systems/communityConcierge.js'), 'utf8');
assert.match(runtime, /saveOnboarding\(guild\.id, \{\s+roadmapChannelId: channel\.id,\s+roadmapMessageId: message\.id/s);
assert.doesNotMatch(runtime, /RoadmapPublicationPersistenceFeature/);
console.log('Roadmap reuse feature preparation leaves production runtime and reuse feature absent');
