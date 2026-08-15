const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
const runtime = fs.readFileSync(path.join(root, 'src/systems/communityConcierge.js'), 'utf8');
const roadmap = runtime.match(/async function setupRoadmapPanel\(guild\) \{([\s\S]*?)\n\}\n\nasync function handleConciergeButton/)[1];

assert.match(roadmap, /communityRoadmapAdapterPairFeature\.createAdapterPair/);
assert.match(roadmap, /lookupPort\.lookupTrackedMessage/);
assert.match(roadmap, /mutationPort\.edit/);
assert.match(roadmap, /mutationPort\.send/);
assert.match(roadmap, /createRoadmapPublicationPersistenceRequest/);
assert.match(roadmap, /communityRoadmapPersistenceFeature\.persist/);
assert.doesNotMatch(roadmap, /channel\.messages\.fetch\s*\(/);
assert.doesNotMatch(roadmap, /message\.edit\s*\(/);
assert.doesNotMatch(roadmap, /channel\.send\s*\(/);
assert.doesNotMatch(roadmap, /saveOnboarding\s*\(/);
assert.doesNotMatch(roadmap, /persistCommunityPublicationRecord\.execute/);
assert.doesNotMatch(roadmap, /readFile|writeFile|Repository|FilesystemAdapter|ResourceSession|MessageLookupAdapter|MessageMutationAdapter|AdapterPairFactory/);

for (const absent of [
  'src/infrastructure/community/roadmapPublication/RoadmapPublicationStateFilesystemAdapter.js',
  'src/infrastructure/community/roadmapPublication/RoadmapPublicationStateRepository.js',
  'src/application/community/roadmapPublication/RoadmapPublicationPersistencePort.js'
]) assert.equal(fs.existsSync(path.join(root, absent)), false, `${absent} must not be duplicated`);

console.log('Roadmap runtime closure guards prohibit direct I/O, direct generic persistence, and duplicate abstractions.');
