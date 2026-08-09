const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..', '..');
const production = path.join(root, 'src', 'systems', 'communityConcierge.js');
assert.equal(fs.existsSync(production), true);
assert.equal(fs.existsSync(path.join(root, 'tests', 'helpers', 'createCommunityRoadmapContinuationHarness.js')), true);
assert.equal(fs.existsSync(path.join(root, 'tests', 'fixtures', 'community', 'community-roadmap-continuation-cases.json')), true);
console.log('Community Roadmap continuation preparation diff guard passed');
