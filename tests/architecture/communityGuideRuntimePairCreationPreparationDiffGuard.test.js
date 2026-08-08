const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..', '..');
const runtime = fs.readFileSync(path.join(root, 'src/systems/communityConcierge.js'), 'utf8');

assert.equal(runtime.includes('createCommunityGuideAdapterPairFeature'), true);
assert.equal(/GuidePublicationAdapterPairFactory|GuidePublicationResourceSession|lookupPort|mutationPort/.test(runtime), false);
for (const forbidden of [
  'src/application/community/guidePublication/RuntimePairCreationUseCase.js',
  'src/infrastructure/community/guidePublication/RuntimePairCreationAdapter.js'
]) assert.equal(fs.existsSync(path.join(root, forbidden)), false, forbidden);
console.log('Community guide runtime pair creation preparation diff guard passed');
