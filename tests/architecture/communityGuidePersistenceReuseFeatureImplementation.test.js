const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
const source = fs.readFileSync(path.join(root, 'src/composition/communityGuidePersistenceFeature.js'), 'utf8');
assert.match(source, /function createCommunityGuidePersistenceFeature/);
assert.match(source, /mapGuidePersistenceRequestToGenericInput/);
assert.match(source, /persistCommunityPublicationRecord\s*\.\s*execute/);
assert.doesNotMatch(source, /node:fs|readFile|writeFile|onboarding-flows\.json|discord\.js|saveOnboarding|communityConcierge/);
assert.doesNotMatch(source, /communityPublicationStateFilesystemAdapter|communityPublicationRecordRepository|persistCommunityPublicationRecordUseCase/);
assert.doesNotMatch(source, /GuidePersistenceFilesystemAdapter|GuidePersistenceWriter|GuidePersistenceRepository|GuidePersistencePort/);
assert.doesNotMatch(source, /RoadmapPublicationPersistenceRequest|communityRoadmapPersistenceFeature/);
assert.doesNotMatch(source, /\basync\b|\bawait\b|Promise\.|updatedAt|console\.|logger|logError/);
console.log('Guide persistence reuse feature remains a synchronous Composition-only delegation.');
