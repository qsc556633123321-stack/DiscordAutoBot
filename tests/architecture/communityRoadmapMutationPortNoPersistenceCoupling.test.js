const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(path.resolve(__dirname, '../../tests/fakes/community/FakeCommunityRoadmapMutationPort.js'), 'utf8');
assert.doesNotMatch(source, /saveOnboarding|persist|repository|node:fs|writeFile/);
console.log('Roadmap mutation Port candidate has no persistence coupling');
