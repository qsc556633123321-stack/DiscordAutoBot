const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
const runtime = fs.readFileSync(path.join(root, 'src/systems/communityConcierge.js'), 'utf8');
const roadmap = runtime.match(/async function setupRoadmapPanel\(guild\) \{([\s\S]*?)\n\}\n\nasync function handleConciergeButton/)[1];

assert.match(roadmap, /const \{ lookupPort, mutationPort, getRetainedMessage \}/);
assert.match(roadmap, /mutationPort\.edit\(\{ messageId: message\.id, payload \}\)/);
assert.match(roadmap, /const sendResult = await mutationPort\.send\(\{ payload \}\)/);
assert.match(roadmap, /retainedMessage\.id !== sendResult\.messageId/);
assert.match(roadmap, /communityRoadmapPersistenceFeature\.persist\(persistenceRequest\)/);
assert.doesNotMatch(roadmap, /channel\.messages\.fetch\(roadmapMessageId\)|await message\.edit\(payload\)|message = await channel\.send\(payload\)/);
assert.doesNotMatch(roadmap, /RoadmapPublicationMessageMutationAdapter|RoadmapPublicationResourceSession|getRetainedMutationFailure/);
console.log('Roadmap runtime mutation redirect implementation diff guard passed');
