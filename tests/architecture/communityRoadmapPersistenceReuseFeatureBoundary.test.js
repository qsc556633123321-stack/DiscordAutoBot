const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(path.resolve(__dirname, '../fakes/community/FakeProductionShapeRoadmapPersistenceFeature.js'), 'utf8');
assert.match(source, /mapRoadmapPublicationPersistenceRequestToGenericInput/);
assert.match(source, /persistCommunityPublicationRecord\.execute/);
assert.doesNotMatch(source, /node:fs|writeFile|readFile|discord\.js|communityPublicationStateFilesystemAdapter|communityPublicationRecordRepository|saveOnboarding/);
console.log('Roadmap reuse feature candidate depends only on request mapper and generic feature surface');
