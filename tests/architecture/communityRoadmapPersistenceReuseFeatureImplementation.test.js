const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(
  path.resolve(__dirname, '../../src/composition/communityRoadmapPersistenceFeature.js'),
  'utf8'
);

assert.match(source, /function createCommunityRoadmapPersistenceFeature/);
assert.match(source, /mapRoadmapPublicationPersistenceRequestToGenericInput/);
assert.match(source, /persistCommunityPublicationRecord\s*\.\s*execute/);
assert.doesNotMatch(source, /node:fs|readFile|writeFile|onboarding-flows\.json|discord\.js|saveOnboarding|communityConcierge/);
assert.doesNotMatch(source, /communityPublicationStateFilesystemAdapter|communityPublicationRecordRepository|persistCommunityPublicationRecordUseCase/);
assert.doesNotMatch(source, /RoadmapPublicationStateRepository|RoadmapPublicationPersistencePort|RoadmapPersistenceWriter/);
assert.doesNotMatch(source, /async\s+persist|await\s|Promise\./);

console.log('Roadmap persistence reuse feature remains a synchronous composition-only delegation.');
