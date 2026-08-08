const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..', '..');
const source = fs.readFileSync(path.join(root, 'src/composition/communityGuideAdapterPairFeature.js'), 'utf8');

for (const file of [
  'src/infrastructure/community/guidePublication/GuidePublicationAdapterPairFactory.js',
  'src/infrastructure/community/guidePublication/GuidePublicationResourceSession.js',
  'src/infrastructure/community/guidePublication/GuidePublicationMessageLookupDiscordAdapter.js',
  'src/infrastructure/community/guidePublication/GuidePublicationMessageMutationDiscordAdapter.js'
]) assert.equal(fs.existsSync(path.join(root, file)), true, file);
assert.match(source, /GuidePublicationAdapterPairFactory/);
assert.equal(/GuidePublicationResourceSession|GuidePublicationMessageLookupDiscordAdapter|GuidePublicationMessageMutationDiscordAdapter/.test(source), false);
assert.equal(/src\/application|PersistCommunityPublication|Filesystem|Roadmap|saveOnboarding/.test(source), false);
console.log('Community guide adapter pair composition feature implementation boundary passed');
