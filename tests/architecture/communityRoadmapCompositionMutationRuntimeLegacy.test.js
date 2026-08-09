const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const runtime = fs.readFileSync(path.resolve(__dirname, '../../src/systems/communityConcierge.js'), 'utf8');
assert.match(runtime, /mutationPort\.edit\(/);
assert.match(runtime, /mutationPort\.send\(/);
assert.doesNotMatch(runtime, /roadmapMutationPort|RoadmapPublicationMessageMutationAdapter/);
console.log('Roadmap runtime mutation remains Composition-only after redirect');
