const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(path.resolve(__dirname, '../../src/systems/communityConcierge.js'), 'utf8');
const roadmap = source.match(/async function setupRoadmapPanel\(guild\) \{([\s\S]*?)\n\}\n\nasync function maybeAddRole/)[1];
assert.match(roadmap, /communityRoadmapAdapterPairFeature\.createAdapterPair\(\{ ensuredChannel: channel \}\)/);
assert.match(roadmap, /channel\.messages\.fetch\(roadmapMessageId\)\.catch\(\(\) => null\)/);
assert.doesNotMatch(roadmap, /lookupPort\.lookupTrackedMessage|getRetainedMessage/);
console.log('Roadmap lookup redirect remains preparation-only in production runtime');
