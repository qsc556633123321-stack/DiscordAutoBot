const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
const runtime = fs.readFileSync(path.join(root, 'src/systems/communityConcierge.js'), 'utf8');
const roadmap = runtime.match(/async function setupRoadmapPanel\(guild\) \{([\s\S]*?)\n\}\n\nasync function handleConciergeButton/)[1];
assert.match(runtime, /const communityRoadmapAdapterPairFeature = createCommunityRoadmapAdapterPairFeature\(\);/);
assert.match(roadmap, /const channel = await getOrCreateRoadmapChannel\(guild\);\s+const \{ lookupPort, mutationPort, getRetainedMessage \} =\s+communityRoadmapAdapterPairFeature\.createAdapterPair\(\{ ensuredChannel: channel \}\);/s);
assert.match(roadmap, /lookupPort\.lookupTrackedMessage\(\{ messageId: roadmapMessageId \}\)/);
assert.match(roadmap, /mutationPort\.edit\(/);
assert.match(roadmap, /mutationPort\.send\(/);
assert.doesNotMatch(roadmap, /saveOnboarding\(guild\.id/);
assert.doesNotMatch(roadmap, /RoadmapPublicationMessageMutationAdapter|getRetainedMutationFailure/);
console.log('Roadmap runtime Pair creation implementation diff guard passed');
