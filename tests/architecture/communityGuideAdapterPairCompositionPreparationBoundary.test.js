const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..', '..');
const runtime = fs.readFileSync(path.join(root, 'src/systems/communityConcierge.js'), 'utf8');

for (const file of [
  'src/infrastructure/community/guidePublication/GuidePublicationResourceSession.js',
  'src/infrastructure/community/guidePublication/GuidePublicationMessageLookupDiscordAdapter.js',
  'src/infrastructure/community/guidePublication/GuidePublicationMessageMutationDiscordAdapter.js'
]) assert.equal(fs.existsSync(path.join(root, file)), true, file);
assert.equal(fs.existsSync(path.join(root, 'src/infrastructure/community/guidePublication/GuidePublicationAdapterPairFactory.js')), false);
assert.equal(fs.existsSync(path.join(root, 'src/composition/communityGuideAdapterPairFeature.js')), false);
assert.equal(runtime.includes('GuidePublicationAdapterPairFactory'), false);
console.log('Guide adapter pair composition preparation boundary passed');
