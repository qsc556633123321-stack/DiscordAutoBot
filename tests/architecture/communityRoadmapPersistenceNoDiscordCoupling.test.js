const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(path.resolve(__dirname, '../fakes/community/FakeRoadmapPublicationPersistencePort.js'), 'utf8');
assert.doesNotMatch(source, /discord\.js|Guild|Channel|Message|Client/);
console.log('Roadmap test-only persistence Port candidate has no Discord coupling');
