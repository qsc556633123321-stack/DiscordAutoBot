const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..', '..');

for (const file of [
  'docs/refactor-audit/COMMUNITY_GUIDE_MESSAGE_LOOKUP_APPLICATION_PORT_PATTERN_AUDIT.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_MESSAGE_LOOKUP_INFRASTRUCTURE_ADAPTER_READINESS.md',
  'src/application/community/ports/GuidePublicationMessageLookupPort.js',
  'src/application/community/guideLookup/GuidePublicationMessageLookupStatus.js',
  'src/application/community/guideLookup/GuidePublicationMessageLookupRequest.js',
  'src/application/community/guideLookup/GuidePublicationMessageLookupResult.js',
  'tests/fakes/community/FakeGuidePublicationMessageLookupPort.js',
  'tests/application/community/guideLookup/guidePublicationMessageLookupApplicationPort.test.js',
  'tests/application/community/guideLookup/guidePublicationMessageLookupMalformedIdentityCompatibility.test.js',
  'tests/application/community/guideLookup/guidePublicationMessageLookupSkippedCompatibility.test.js',
  'tests/application/community/guideLookup/guidePublicationMessageLookupToMutationPlanCompatibility.test.js',
  'tests/application/community/guideLookup/guidePublicationMessageLookupMutationAdapterSeparation.test.js',
  'tests/application/community/guideLookup/guidePublicationMessageLookupPersistenceSeparation.test.js'
]) assert.equal(fs.existsSync(path.join(root, file)), true, file);
assert.equal(fs.existsSync(path.join(root, 'src/infrastructure/community/GuidePublicationMessageLookupDiscordAdapter.js')), false);
assert.equal(fs.existsSync(path.join(root, 'src/composition/communityGuidePublicationMessageLookupFeature.js')), false);
console.log('Guide message lookup Application port integrity passed');
