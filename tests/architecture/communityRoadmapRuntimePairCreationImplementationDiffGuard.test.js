const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
const runtime = fs.readFileSync(path.join(root, 'src/systems/communityConcierge.js'), 'utf8');
const roadmap = runtime.match(/async function setupRoadmapPanel\(guild\) \{([\s\S]*?)\n\}\n\nasync function maybeAddRole/)[1];
assert.match(runtime, /const communityRoadmapAdapterPairFeature = createCommunityRoadmapAdapterPairFeature\(\);/);
assert.match(roadmap, /const channel = await getOrCreateRoadmapChannel\(guild\);\s+communityRoadmapAdapterPairFeature\.createAdapterPair\(\{ ensuredChannel: channel \}\);/s);
assert.match(roadmap, /channel\.messages\.fetch\(roadmapMessageId\)\.catch\(\(\) => null\)/);
assert.match(roadmap, /message\.edit\(payload\)/);
assert.match(roadmap, /channel\.send\(payload\)/);
assert.match(roadmap, /saveOnboarding\(guild\.id/);
assert.doesNotMatch(roadmap, /lookupPort|mutationPort|getRetainedMessage/);
console.log('Roadmap runtime Pair creation implementation diff guard passed');
