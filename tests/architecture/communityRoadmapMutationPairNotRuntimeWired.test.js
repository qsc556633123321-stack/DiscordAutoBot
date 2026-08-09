const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const runtime = fs.readFileSync(path.resolve(__dirname, '../../src/systems/communityConcierge.js'), 'utf8');
assert.doesNotMatch(runtime, /roadmapMutationPort|RoadmapPublicationMessageMutationAdapter/);
assert.match(runtime, /mutationPort\.edit\(/);
assert.match(runtime, /mutationPort\.send\(/);
console.log('Roadmap runtime mutation uses the existing Pair surface without direct Adapter wiring');
