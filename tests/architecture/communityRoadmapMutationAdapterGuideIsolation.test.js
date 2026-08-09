const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(path.resolve(__dirname, '../../src/infrastructure/community/roadmapPublication/RoadmapPublicationMessageMutationAdapter.js'), 'utf8');
assert.doesNotMatch(source, /GuidePublication|guideMutation|GuidePublicationResourceSession/);
console.log('Roadmap production mutation adapter remains Guide-isolated');
