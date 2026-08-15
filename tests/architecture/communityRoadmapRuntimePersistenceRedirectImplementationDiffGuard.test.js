const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
for (const relativePath of [
  'src/application/community/roadmapPublication/RoadmapPublicationPersistenceRequest.js',
  'src/composition/communityRoadmapPersistenceFeature.js',
  'src/composition/communityPublicationStateFeature.js',
  'src/application/community/persistCommunityPublicationRecordUseCase.js',
  'src/infrastructure/community/communityPublicationStateFilesystemAdapter.js'
]) {
  assert.equal(fs.existsSync(path.join(root, relativePath)), true);
}
for (const relativePath of [
  'src/infrastructure/community/roadmapPublicationStateFilesystemAdapter.js',
  'src/infrastructure/community/roadmapPublicationStateRepository.js',
  'src/application/community/ports/RoadmapPublicationPersistencePort.js'
]) {
  assert.equal(fs.existsSync(path.join(root, relativePath)), false);
}
const runtime = fs.readFileSync(path.join(root, 'src/systems/communityConcierge.js'), 'utf8');
const roadmap = runtime.match(/async function setupRoadmapPanel\(guild\) \{([\s\S]*?)\n\}\n\nasync function handleConciergeButton/)[1];
assert.doesNotMatch(roadmap, /saveOnboarding\(guild\.id, \{\s+roadmapChannelId/);
assert.doesNotMatch(roadmap, /readFile|writeFile|JSON\.stringify|repository|filesystem/);
console.log('Roadmap runtime persistence redirect has no duplicate persistence ownership.');
