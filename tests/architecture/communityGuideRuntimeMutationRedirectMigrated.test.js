const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..');
const source = fs.readFileSync(path.join(root, 'src/systems/communityConcierge.js'), 'utf8');
const guideSource = source.slice(
  source.indexOf('async function setupCommunityGuide'),
  source.indexOf('async function setupRoadmapPanel')
);

assert.match(guideSource, /mutationPort\.edit\(\{/);
assert.match(guideSource, /mutationPort\.send\(\{/);
assert.match(guideSource, /getRetainedMessage\(\)/);
assert.match(guideSource, /throwMutationFailure\(getRetainedMutationFailure,/);
assert.doesNotMatch(guideSource, /await message\.edit\(payload\)/);
assert.doesNotMatch(guideSource, /message\s*=\s*await channel\.send\(payload\)/);

console.log('Community guide runtime mutation redirect migrated guard passed');
