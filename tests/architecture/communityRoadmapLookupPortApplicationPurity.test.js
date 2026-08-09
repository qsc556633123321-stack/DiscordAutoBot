const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(path.resolve(__dirname, '../../src/application/community/roadmapPublication/RoadmapPublicationMessageLookupPort.js'), 'utf8');
assert.doesNotMatch(source, /require\(/);
assert.doesNotMatch(source, /discord\.js|ResourceSession|rawError|cause/);
assert.doesNotMatch(source, /Failure|LookupRejected|Unknown/);
console.log('Roadmap lookup port application purity passed');
