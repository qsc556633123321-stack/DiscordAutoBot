const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const runtime = fs.readFileSync(path.resolve(__dirname, '../../src/systems/communityConcierge.js'), 'utf8');
const roadmapRuntime = runtime.match(/async function setupRoadmapPanel\(guild\) \{([\s\S]*?)\n\}\n\nasync function maybeAddRole/)[1];
assert.match(roadmapRuntime, /message\.edit\(payload\)/);
assert.match(roadmapRuntime, /channel\.send\(payload\)/);
assert.doesNotMatch(roadmapRuntime, /mutationPort/);
console.log('Roadmap runtime mutation remains legacy-owned during Pair preparation');
