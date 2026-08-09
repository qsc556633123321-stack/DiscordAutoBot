const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
const runtime = fs.readFileSync(path.join(root, 'src/systems/communityConcierge.js'), 'utf8');
const roadmap = runtime.match(/async function setupRoadmapPanel\(guild\) \{([\s\S]*?)\n\}\n\nasync function maybeAddRole/)[1];
assert.match(roadmap, /channel\.messages\.fetch\(roadmapMessageId\)\.catch\(\(\) => null\)/);
assert.doesNotMatch(roadmap, /lookupPort\.lookupTrackedMessage|getRetainedMessage/);
assert.equal(fs.existsSync(path.join(root, 'tests/fixtures/community/community-roadmap-runtime-lookup-redirect-cases.json')), true);
console.log('Roadmap lookup redirect preparation static diff guard passed');
