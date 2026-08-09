const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(path.resolve(__dirname, '../../src/systems/communityConcierge.js'), 'utf8');
const roadmap = source.match(/async function setupRoadmapPanel\(guild\) \{([\s\S]*?)\n\}\n\nasync function maybeAddRole/)[1];
assert.match(roadmap, /await message\.edit\(payload\)/);
assert.match(roadmap, /message = await channel\.send\(payload\)/);
assert.match(roadmap, /saveOnboarding\(guild\.id/);
assert.doesNotMatch(roadmap, /mutationPort|editTrackedMessage|sendMessage/);
console.log('Roadmap runtime mutation remains legacy-owned during Session mutation preparation');
