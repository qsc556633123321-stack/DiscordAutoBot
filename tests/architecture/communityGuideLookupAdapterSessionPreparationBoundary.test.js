const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..', '..');
const runtime = fs.readFileSync(path.join(root, 'src/systems/communityConcierge.js'), 'utf8');

assert.equal(fs.existsSync(path.join(root, 'src/infrastructure/community/guidePublication/GuidePublicationResourceSession.js')), true);
for (const file of [
  'src/infrastructure/community/guidePublication/GuidePublicationMessageLookupDiscordAdapter.js',
  'src/infrastructure/community/GuidePublicationMessageLookupDiscordAdapter.js',
  'src/infrastructure/community/GuidePublicationMessageMutationDiscordAdapter.js',
  'src/composition/communityGuideLookupAdapterSessionFeature.js'
]) assert.equal(fs.existsSync(path.join(root, file)), false, file);
assert.equal(runtime.includes('GuidePublicationResourceSession'), false);
console.log('Guide lookup adapter session preparation boundary passed');
