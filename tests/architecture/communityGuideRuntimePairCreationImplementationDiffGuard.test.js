const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..', '..');
const source = fs.readFileSync(path.join(root, 'src/systems/communityConcierge.js'), 'utf8');

assert.match(source, /const communityGuideAdapterPairFeature = createCommunityGuideAdapterPairFeature\(\);/);
assert.match(source, /const channel = await getOrCreateGuideChannel\(guild\);\s+communityGuideAdapterPairFeature\.createAdapterPair\(\{ ensuredChannel: channel \}\);\s+const payload = await buildGuidePayload\(guild\);/s);
assert.match(source, /channel\.messages\.fetch\(guideMessageId\)\.catch\(\(\) => null\)/);
assert.match(source, /message\.edit\(payload\)/);
assert.match(source, /channel\.send\(payload\)/);
console.log('Community guide runtime pair creation implementation diff guard passed');
