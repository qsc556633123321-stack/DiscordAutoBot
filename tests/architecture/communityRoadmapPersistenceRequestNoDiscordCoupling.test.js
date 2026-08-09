const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(path.resolve(__dirname, '../fakes/community/FakeRoadmapPublicationPersistenceRequest.js'), 'utf8');
assert.doesNotMatch(source, /require\(|discord\.js|node:fs|writeFile|readFile/);
console.log('Roadmap persistence request preparation candidate has no Discord or filesystem coupling');
