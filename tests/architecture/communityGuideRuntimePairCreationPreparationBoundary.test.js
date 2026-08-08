const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..', '..');
const runtime = fs.readFileSync(path.join(root, 'src/systems/communityConcierge.js'), 'utf8');

assert.equal(fs.existsSync(path.join(root, 'src/composition/communityGuideAdapterPairFeature.js')), true);
assert.equal(fs.existsSync(path.join(root, 'src/infrastructure/community/guidePublication/GuidePublicationAdapterPairFactory.js')), true);
assert.equal(runtime.includes('communityGuideAdapterPairFeature'), false);
assert.equal(runtime.includes('GuidePublicationAdapterPairFactory'), false);
assert.match(runtime, /channel\.messages\.fetch\(guideMessageId\)\.catch\(\(\) => null\)/);
assert.match(runtime, /message\.edit\(payload\)/);
assert.match(runtime, /channel\.send\(payload\)/);
console.log('Community guide runtime pair creation preparation boundary passed');
