const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..', '..');
const runtime = fs.readFileSync(path.join(root, 'src/systems/communityConcierge.js'), 'utf8');

assert.equal(runtime.includes('createCommunityGuideAdapterPairFeature'), true);
assert.equal(/GuidePublicationAdapterPairFactory|GuidePublicationResourceSession|lookupPort|mutationPort/.test(runtime), false);
for (const file of [
  'src/infrastructure/community/guidePublication/GuideEnsuredChannelAdapter.js',
  'src/application/community/guidePublication/NormalizeGuideChannelUseCase.js'
]) assert.equal(fs.existsSync(path.join(root, file)), false, file);
console.log('Guide ensured channel surface preparation diff guard passed');
