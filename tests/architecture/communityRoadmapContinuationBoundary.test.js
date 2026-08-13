const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const source = fs.readFileSync(path.resolve(__dirname, '../../src/systems/communityConcierge.js'), 'utf8');
const guide = source.slice(source.indexOf('async function setupCommunityGuide'), source.indexOf('async function setupRoadmapPanel'));
const roadmap = source.slice(source.indexOf('async function setupRoadmapPanel'), source.indexOf('async function maybeAddRole'));

assert.match(guide, /lookupPort\.lookup\(/);
assert.match(guide, /mutationPort\.edit\(/);
assert.match(guide, /mutationPort\.send\(/);
assert.doesNotMatch(roadmap, /saveOnboarding\(guild\.id/);
assert.doesNotMatch(guide, /roadmapMessageId/);
console.log('Community Guide/Roadmap ownership boundary passed');
