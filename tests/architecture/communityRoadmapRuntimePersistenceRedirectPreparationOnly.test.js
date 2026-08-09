const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
const runtime = fs.readFileSync(path.join(root, 'src/systems/communityConcierge.js'), 'utf8');
const roadmap = runtime.match(/async function setupRoadmapPanel\(guild\) \{([\s\S]*?)\n\}\n\nasync function maybeAddRole/)[1];
const guide = runtime.match(/async function setupCommunityGuide\(guild, options = \{\}\) \{([\s\S]*?)\n\}\n\nasync function setupRoadmapPanel/)[1];

assert.match(roadmap, /saveOnboarding\(guild\.id, \{\s+roadmapChannelId: channel\.id,\s+roadmapMessageId: message\.id/s);
assert.doesNotMatch(roadmap, /communityRoadmapPersistenceFeature|createRoadmapPublicationPersistenceRequest|roadmapChannelId.*patch/);
assert.match(guide, /saveOnboarding\(guild\.id, \{\s+guideChannelId: channel\.id,\s+guideMessageId: message\.id/s);

console.log('Roadmap persistence redirect preparation leaves Guide and Roadmap runtime persistence legacy-owned.');
