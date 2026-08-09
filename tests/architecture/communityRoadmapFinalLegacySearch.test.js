const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const runtime = fs.readFileSync(path.resolve(__dirname, '../../src/systems/communityConcierge.js'), 'utf8');
const roadmap = runtime.match(/async function setupRoadmapPanel\(guild\) \{([\s\S]*?)\n\}\n\nasync function maybeAddRole/)[1];
const guide = runtime.match(/async function setupCommunityGuide\(guild, options = \{\}\) \{([\s\S]*?)\n\}\n\nasync function setupRoadmapPanel/)[1];

assert.doesNotMatch(roadmap, /saveOnboarding/);
assert.match(guide, /saveOnboarding\(guild\.id/);
assert.match(roadmap, /roadmap\.messageId \|\| data\.roadmapMessageId/);
assert.match(roadmap, /createRoadmapPublicationPersistenceRequest\(\{ guildId: guild\.id, channelId: channel\.id, messageId: message\.id \}\)/);
console.log('Roadmap final legacy search classifies Guide saveOnboarding as shared legacy ownership and Roadmap schema reads as allowed.');
