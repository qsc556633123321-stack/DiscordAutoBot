const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
const source = fs.readFileSync(path.join(root, 'src/infrastructure/community/roadmapPublication/RoadmapPublicationResourceSession.js'), 'utf8');
assert.match(source, /editTrackedMessage/);
assert.match(source, /sendMessage/);
assert.match(source, /getRetainedMutationFailure/);
console.log('Roadmap production Resource Session exposes the approved mutation-only extension');
