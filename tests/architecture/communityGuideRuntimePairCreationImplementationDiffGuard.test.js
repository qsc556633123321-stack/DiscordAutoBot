const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..', '..');
const source = fs.readFileSync(path.join(root, 'src/systems/communityConcierge.js'), 'utf8');
const guideSource = source.slice(
  source.indexOf('async function setupCommunityGuide'),
  source.indexOf('async function setupRoadmapPanel')
);

assert.match(source, /const communityGuideAdapterPairFeature = createCommunityGuideAdapterPairFeature\(\);/);
assert.match(guideSource, /const channel = await getOrCreateGuideChannel\(guild\);\s+const \{ lookupPort, mutationPort, getRetainedMessage, getRetainedMutationFailure \}\s+=\s+communityGuideAdapterPairFeature\.createAdapterPair\(\{ ensuredChannel: channel \}\);\s+const payload = await buildGuidePayload\(guild\);/s);
assert.match(guideSource, /lookupPort\.lookup\(\{/);
assert.match(guideSource, /mutationPort\.edit\(\{/);
assert.match(guideSource, /mutationPort\.send\(\{/);
console.log('Community guide runtime pair creation implementation diff guard passed');
