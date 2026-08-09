const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
const runtime = fs.readFileSync(path.join(root, 'src/systems/communityConcierge.js'), 'utf8');
const roadmap = runtime.match(/async function setupRoadmapPanel\(guild\) \{([\s\S]*?)\n\}\n\nasync function maybeAddRole/)[1];

assert.match(roadmap, /saveOnboarding\(guild\.id, \{\s+roadmapChannelId: channel\.id,\s+roadmapMessageId: message\.id/s);
assert.doesNotMatch(runtime, /createCommunityRoadmapPersistenceFeature|createRoadmapPublicationPersistenceRequest/);
assert.doesNotMatch(roadmap, /roadmapChannelId.*patch|roadmapMessageId.*patch/);
console.log('Roadmap persistence redirect preparation guards the unchanged production runtime boundary.');
