const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..', '..');
const runtime = fs.readFileSync(path.join(root, 'src/systems/communityConcierge.js'), 'utf8');

assert.equal(runtime.includes('communityGuideAdapterPairFeature'), true);
assert.equal(runtime.includes('GuidePublicationAdapterPairFactory'), false);
assert.equal(runtime.includes('GuidePublicationResourceSession'), false);
assert.equal(runtime.includes('lookupPort.lookup'), false);
assert.equal(runtime.includes('mutationPort.edit'), false);
assert.equal(runtime.includes('mutationPort.send'), false);
assert.match(runtime, /channel\.messages\.fetch\(guideMessageId\)\.catch\(\(\) => null\)/);
assert.match(runtime, /message\.edit\(payload\)/);
assert.match(runtime, /channel\.send\(payload\)/);
console.log('Community guide adapter pair composition feature not-wired guard passed');
