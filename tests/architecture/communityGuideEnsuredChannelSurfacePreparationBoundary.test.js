const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..', '..');
const runtime = fs.readFileSync(path.join(root, 'src/systems/communityConcierge.js'), 'utf8');

for (const file of [
  'src/infrastructure/community/guidePublication/GuidePublicationResourceSession.js',
  'src/infrastructure/community/guidePublication/GuidePublicationAdapterPairFactory.js',
  'src/composition/communityGuideAdapterPairFeature.js'
]) assert.equal(fs.existsSync(path.join(root, file)), true, file);
assert.equal(runtime.includes('communityGuideAdapterPairFeature'), false);
assert.equal(runtime.includes('GuidePublicationAdapterPairFactory'), false);
console.log('Guide ensured channel surface preparation boundary passed');
