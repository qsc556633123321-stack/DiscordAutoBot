const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const source = fs.readFileSync(path.resolve(__dirname, '../../src/systems/communityConcierge.js'), 'utf8');
const roadmap = source.slice(source.indexOf('async function setupRoadmapPanel'), source.indexOf('async function maybeAddRole'));

assert.match(roadmap, /channel\.messages\.fetch\(roadmapMessageId\)\.catch\(\(\) => null\)/);
assert.match(roadmap, /message\.edit\(payload\)/);
assert.match(roadmap, /channel\.send\(payload\)/);
assert.doesNotMatch(roadmap, /RoadmapPublicationResourceSession|roadmapPort|roadmapAdapter/i);
console.log('Community Roadmap continuation remains legacy preparation-only');
