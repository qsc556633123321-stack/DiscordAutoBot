const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(path.resolve(__dirname, '../../src/systems/communityConcierge.js'), 'utf8');
const roadmap = source.match(/async function setupRoadmapPanel\(guild\) \{([\s\S]*?)\n\}\n\nasync function maybeAddRole/)[1];
assert.match(roadmap, /saveOnboarding\(guild\.id, \{\s+roadmapChannelId: channel\.id,\s+roadmapMessageId: message\.id/s);
assert.doesNotMatch(roadmap, /RoadmapPublicationPersistenceRequest|mapRoadmapPublicationPersistence|savePublicationState/);
console.log('Roadmap persistence request preparation leaves runtime persistence unchanged');
