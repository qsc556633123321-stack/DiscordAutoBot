const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../..');

for (const file of [
  'docs/refactor-audit/COMMUNITY_GUIDE_RUNTIME_LOOKUP_CURRENT_FLOW.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_LEGACY_LOOKUP_CONTRACT.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_LOOKUP_PORT_RESULT_CONTRACT.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_LOOKUP_ADAPTER_FAILURE_MATRIX.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_LOOKUP_RUNTIME_MAPPING_CANDIDATES.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_RUNTIME_LOOKUP_INPUT_CONTRACT.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_RUNTIME_LOOKUP_SKIP_BOUNDARY.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_RUNTIME_LOOKUP_AVAILABLE_CONTINUITY.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_RUNTIME_LOOKUP_UNAVAILABLE_CONTINUITY.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_LOOKUP_SESSION_RETENTION_LEGACY_MUTATION.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_LOOKUP_PLAN_INPUT_EQUIVALENCE.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_RUNTIME_LOOKUP_MALFORMED_ID.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_RUNTIME_LOOKUP_FAILURE_TIMING.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_LOOKUP_PERSISTENCE_ORDERING.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_LOOKUP_ROADMAP_ORDERING.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_RUNTIME_LOOKUP_REDIRECT_PREPARATION_BLOCKERS.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_RUNTIME_LOOKUP_REDIRECT_IMPLEMENTATION_READINESS.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_RUNTIME_LOOKUP_REDIRECT_APPROVED_DIFF.md',
  'tests/fakes/community/FakeCommunityGuideRuntimeLookupRedirect.js',
  'tests/fixtures/community/community-guide-runtime-lookup-redirect-cases.json',
  'tests/integration/community/communityGuideRuntimeLookupRedirectEquivalence.test.js',
  'tests/integration/community/communityGuideRuntimeLookupFailureMapping.test.js',
  'tests/integration/community/communityGuideRuntimeLookupAvailableIdentity.test.js',
  'tests/integration/community/communityGuideRuntimeLookupSkip.test.js',
  'tests/integration/community/communityGuideRuntimeLookupMalformedId.test.js',
  'tests/architecture/communityGuideRuntimeLookupPreparationNoMutationRedirect.test.js',
  'tests/architecture/communityGuideRuntimeLookupPreparationLegacyGuard.test.js',
  'tests/architecture/communityGuideRuntimeLookupRedirectPreparationBoundary.test.js',
  'tests/architecture/communityGuideRuntimeLookupRedirectPreparationDiffGuard.test.js'
]) assert.equal(fs.existsSync(path.join(root, file)), true, file);

assert.equal(require('../fixtures/community/community-guide-runtime-lookup-redirect-cases.json').length, 80);
const runtime = fs.readFileSync(path.join(root, 'src/systems/communityConcierge.js'), 'utf8');
assert.match(runtime, /channel\.messages\.fetch\(guideMessageId\)\.catch\(\(\) => null\)/);
assert.doesNotMatch(runtime, /lookupPort\.lookup\s*\(/);
assert.doesNotMatch(runtime, /mutationPort\.(?:edit|send)\s*\(/);
console.log('Community guide runtime lookup redirect preparation integrity passed');
