const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..', '..');
const runtime = fs.readFileSync(path.join(root, 'src/systems/communityConcierge.js'), 'utf8');

assert.equal(fs.existsSync(path.join(root, 'src/infrastructure/community/guidePublication/GuidePublicationAdapterPairFactory.js')), true);
assert.equal(runtime.includes('GuidePublicationAdapterPairFactory'), false);
assert.match(runtime, /channel\.messages\.fetch\(guideMessageId\)\.catch\(\(\) => null\)/);
assert.equal(fs.existsSync(path.join(root, 'src/composition/communityGuideAdapterPairFeature.js')), false);
console.log('Guide production adapter pair factory not wired guard passed');
