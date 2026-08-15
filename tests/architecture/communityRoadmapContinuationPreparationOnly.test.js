const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const source = fs.readFileSync(path.resolve(__dirname, '../../src/systems/communityConcierge.js'), 'utf8');
const roadmap = source.slice(source.indexOf('async function setupRoadmapPanel'), source.indexOf('async function handleConciergeButton'));

assert.match(roadmap, /lookupPort\.lookupTrackedMessage\(\{ messageId: roadmapMessageId \}\)/);
assert.match(roadmap, /message\.edit\(payload\)/);
assert.match(roadmap, /channel\.send\(payload\)/);
assert.doesNotMatch(roadmap, /RoadmapPublicationResourceSession|mutationPort/);
console.log('Community Roadmap continuation retains legacy mutation ownership');
