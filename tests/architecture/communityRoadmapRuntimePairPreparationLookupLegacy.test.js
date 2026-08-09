const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const runtime = fs.readFileSync(path.resolve(__dirname, '../../src/systems/communityConcierge.js'), 'utf8');
const roadmapRuntime = runtime.match(/async function setupRoadmapPanel\(guild\) \{([\s\S]*?)\n\}\n\nasync function maybeAddRole/)[1];
assert.match(roadmapRuntime, /channel\.messages\.fetch\(roadmapMessageId\)\.catch\(\(\) => null\)/);
assert.doesNotMatch(roadmapRuntime, /lookupPort\.lookupTrackedMessage|getRetainedMessage/);
console.log('Roadmap runtime lookup remains legacy-owned during Pair preparation');
