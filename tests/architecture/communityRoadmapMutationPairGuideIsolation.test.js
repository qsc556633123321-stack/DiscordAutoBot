const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(path.resolve(__dirname, '../../src/infrastructure/community/roadmapPublication/RoadmapPublicationAdapterPairFactory.js'), 'utf8');
assert.doesNotMatch(source, /GuidePublication|GuideMutation|GuideResourceSession/);
console.log('Roadmap mutation Pair remains Guide-isolated');
