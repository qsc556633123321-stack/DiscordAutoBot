const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..', '..');
assert.equal(fs.existsSync(path.join(root, 'src', 'systems', 'communityConcierge.js')), true);
assert.equal(fs.existsSync(path.join(root, 'tests', 'fakes', 'community', 'FakeCommunityRoadmapLookupBoundary.js')), true);
console.log('Community Roadmap lookup boundary preparation diff guard passed');
