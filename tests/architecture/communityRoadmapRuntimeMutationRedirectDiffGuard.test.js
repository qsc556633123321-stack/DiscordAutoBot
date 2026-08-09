const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const runtimePath = path.resolve(__dirname, '../../src/systems/communityConcierge.js');
const runtimeSource = fs.readFileSync(runtimePath, 'utf8');
const roadmapRuntime = runtimeSource.match(
  /async function setupRoadmapPanel\(guild\) \{([\s\S]*?)\n\}\n\nasync function maybeAddRole/
)[1];

assert.match(roadmapRuntime, /await message\.edit\(payload\)/);
assert.match(roadmapRuntime, /message = await channel\.send\(payload\)/);
assert.doesNotMatch(roadmapRuntime, /mutationPort\.edit|mutationPort\.send/);
console.log('Roadmap redirect preparation source guard preserves legacy mutation ownership');
