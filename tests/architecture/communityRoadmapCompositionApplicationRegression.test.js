const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(path.resolve(__dirname, '../../src/application/community/roadmapPublication/RoadmapPublicationMessageLookupPort.js'), 'utf8');
assert.doesNotMatch(source, /Composition|AdapterPairFactory|infrastructure/i);
console.log('Roadmap composition preparation preserves application purity');
