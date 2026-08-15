const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const runtime = fs.readFileSync(path.resolve(__dirname, '../../src/systems/communityConcierge.js'), 'utf8');
const roadmapRuntime = runtime.match(/async function setupRoadmapPanel\(guild\) \{([\s\S]*?)\n\}\n\nasync function handleConciergeButton/)[1];
assert.match(roadmapRuntime, /lookupPort\.lookupTrackedMessage\(\{ messageId: roadmapMessageId \}\)/);
assert.match(roadmapRuntime, /getRetainedMessage/);
console.log('Roadmap runtime lookup consumes the Pair during redirect implementation');
