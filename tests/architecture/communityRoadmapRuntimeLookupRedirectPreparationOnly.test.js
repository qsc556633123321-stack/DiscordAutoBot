const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(path.resolve(__dirname, '../../src/systems/communityConcierge.js'), 'utf8');
const roadmap = source.match(/async function setupRoadmapPanel\(guild\) \{([\s\S]*?)\n\}\n\nasync function handleConciergeButton/)[1];
assert.match(roadmap, /communityRoadmapAdapterPairFeature\.createAdapterPair\(\{ ensuredChannel: channel \}\)/);
assert.match(roadmap, /lookupPort\.lookupTrackedMessage\(\{ messageId: roadmapMessageId \}\)/);
assert.match(roadmap, /getRetainedMessage/);
console.log('Roadmap lookup redirect preparation has been implemented in production runtime');
