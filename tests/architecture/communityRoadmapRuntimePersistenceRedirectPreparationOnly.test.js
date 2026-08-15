const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
const runtime = fs.readFileSync(path.join(root, 'src/systems/communityConcierge.js'), 'utf8');
const roadmap = runtime.match(/async function setupRoadmapPanel\(guild\) \{([\s\S]*?)\n\}\n\nasync function handleConciergeButton/)[1];
const guide = runtime.match(/async function setupCommunityGuide\(guild, options = \{\}\) \{([\s\S]*?)\n\}\n\nasync function setupRoadmapPanel/)[1];

assert.match(roadmap, /communityRoadmapPersistenceFeature\.persist\(persistenceRequest\)/);
assert.doesNotMatch(roadmap, /saveOnboarding\(guild\.id, \{\s+roadmapChannelId|roadmapChannelId.*patch/);
assert.doesNotMatch(guide, /saveOnboarding\(guild\.id, \{\s+guideChannelId: channel\.id,\s+guideMessageId: message\.id/s);

console.log('Roadmap persistence redirect preserves the Guide legacy boundary.');
