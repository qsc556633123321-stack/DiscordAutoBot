const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..', '..', '..');
const runtime = fs.readFileSync(path.join(root, 'src/systems/communityConcierge.js'), 'utf8');

assert.equal(runtime.includes('communityGuideAdapterPairFeature'), true);
assert.equal(runtime.includes('GuidePublicationAdapterPairFactory'), false);
assert.match(runtime, /channel\.messages\.fetch\(guideMessageId\)\.catch\(\(\) => null\)/);
console.log('Community guide runtime pair creation rollback boundary characterized');
