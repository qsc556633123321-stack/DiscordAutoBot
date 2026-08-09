const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(path.resolve(__dirname, '../../src/systems/communityConcierge.js'), 'utf8');
const roadmap = source.match(/async function setupRoadmapPanel\(guild\) \{([\s\S]*?)\n\}\n\nasync function maybeAddRole/)[1];
assert.match(roadmap, /lookupPort\.lookupTrackedMessage\(\{ messageId: roadmapMessageId \}\)/);
assert.match(roadmap, /getRetainedMessage\(\)/);
assert.doesNotMatch(roadmap, /channel\.messages\.fetch\(roadmapMessageId\)/);
console.log('Roadmap runtime lookup redirect removes direct legacy fetch');
