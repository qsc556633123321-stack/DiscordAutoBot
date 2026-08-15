const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(path.resolve(__dirname, '../../src/systems/communityConcierge.js'), 'utf8');
const roadmap = source.match(/async function setupRoadmapPanel\(guild\) \{([\s\S]*?)\n\}\n\nasync function handleConciergeButton/)[1];
assert.match(roadmap, /createRoadmapPublicationPersistenceRequest\(\{\s+guildId: guild\.id,\s+channelId: channel\.id,\s+messageId: message\.id/s);
assert.match(roadmap, /communityRoadmapPersistenceFeature\.persist\(persistenceRequest\)/);
assert.doesNotMatch(roadmap, /saveOnboarding\(guild\.id, \{\s+roadmapChannelId/);
console.log('Roadmap runtime persistence redirects through the Roadmap reuse feature');
