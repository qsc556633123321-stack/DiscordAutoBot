const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(path.join(__dirname, '..', '..', 'src/systems/communityConcierge.js'), 'utf8');
for (const token of ['setupCommunityGuide', 'setupRoadmapPanel', 'saveOnboarding', 'writeJson']) assert.match(source, new RegExp(`function ${token}|async function ${token}`));
assert.match(source, /guild\.channels\.create/);
assert.match(source, /channel\.send/);
assert.match(source, /message\.edit/);
console.log('community mutation function inventory passed');
