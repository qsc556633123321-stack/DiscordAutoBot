const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
const runtime = fs.readFileSync(path.join(root, 'src/systems/communityConcierge.js'), 'utf8');
const roadmap = runtime.match(/async function setupRoadmapPanel\(guild\) \{([\s\S]*?)\n\}\n\nasync function maybeAddRole/)[1];
const guide = runtime.match(/async function setupCommunityGuide\(guild, options = \{\}\) \{([\s\S]*?)\n\}\n\nasync function setupRoadmapPanel/)[1];

assert.match(runtime, /createRoadmapPublicationPersistenceRequest/);
assert.match(runtime, /createCommunityRoadmapPersistenceFeature/);
assert.match(roadmap, /messageId: message\.id/);
assert.match(roadmap, /communityRoadmapPersistenceFeature\.persist\(persistenceRequest\)/);
assert.ok(roadmap.indexOf('communityRoadmapPersistenceFeature.persist') > roadmap.indexOf('mutationPort.send'));
assert.doesNotMatch(roadmap, /await\s+communityRoadmapPersistenceFeature\.persist|Promise\.resolve|queueMicrotask|nextTick|setImmediate/);
assert.doesNotMatch(roadmap, /saveOnboarding\(guild\.id, \{\s+roadmapChannelId|persistCommunityPublicationRecord\.execute|roadmapChannelId.*patch|roadmapMessageId.*patch/);
assert.match(guide, /saveOnboarding\(guild\.id, \{\s+guideChannelId: channel\.id,\s+guideMessageId: message\.id/s);

console.log('Roadmap runtime persistence redirect uses semantic synchronous persistence and preserves Guide legacy ownership.');
