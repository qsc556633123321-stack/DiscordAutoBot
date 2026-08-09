const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(path.resolve(__dirname, '../../src/application/community/roadmapPublication/RoadmapPublicationPersistenceRequest.js'), 'utf8');
assert.doesNotMatch(source, /require\(|discord\.js|node:fs|writeFile|readFile|saveOnboarding|communityPublicationStateFilesystemAdapter|persisted|record|updatedAt/);
assert.doesNotMatch(source, /GuidePublication|RoadmapPublicationPersistencePort|RoadmapPublicationStateRepository/);
console.log('Roadmap persistence request application module is pure and Guide-isolated');
