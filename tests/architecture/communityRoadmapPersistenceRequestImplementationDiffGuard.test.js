const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const runtime = fs.readFileSync(path.resolve(__dirname, '../../src/systems/communityConcierge.js'), 'utf8');
const roadmap = runtime.match(/async function setupRoadmapPanel\(guild\) \{([\s\S]*?)\n\}\n\nasync function maybeAddRole/)[1];
assert.match(roadmap, /createRoadmapPublicationPersistenceRequest\(\{/);
assert.doesNotMatch(roadmap, /mapRoadmapPublicationPersistence/);

const index = fs.readFileSync(path.resolve(__dirname, '../../src/application/community/index.js'), 'utf8');
assert.match(index, /RoadmapPublicationPersistenceRequest/);
console.log('Roadmap persistence request implementation is consumed without exposing its mapper to runtime');
