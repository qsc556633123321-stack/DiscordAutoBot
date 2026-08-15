const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(path.resolve(__dirname, '../../src/systems/communityConcierge.js'), 'utf8');
const roadmap = source.match(/async function setupRoadmapPanel\(guild\) \{([\s\S]*?)\n\}\n\nasync function handleConciergeButton/)[1];
assert.match(roadmap, /createRoadmapPublicationPersistenceRequest\(\{/);
assert.doesNotMatch(roadmap, /mapRoadmapPublicationPersistence|savePublicationState|roadmapChannelId.*patch/);
console.log('Roadmap persistence request preparation remains compatible with semantic runtime input');
