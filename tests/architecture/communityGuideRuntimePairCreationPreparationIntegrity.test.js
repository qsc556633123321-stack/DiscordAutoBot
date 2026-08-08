const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..', '..');

for (const file of [
  'docs/refactor-audit/COMMUNITY_GUIDE_RUNTIME_PAIR_CREATION_PREPARATION_BLOCKERS.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_RUNTIME_PAIR_CREATION_FLOW_AUDIT.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_RUNTIME_PAIR_CREATION_INSERTION_POINT.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_RUNTIME_PAIR_CREATOR_ACQUISITION.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_RUNTIME_PAIR_FEATURE_LIFETIME.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_RUNTIME_PAIR_LIFETIME.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_RUNTIME_PAIR_CHANNEL_IDENTITY.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_RUNTIME_PAIR_CREATION_ZERO_IO.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_RUNTIME_PAIR_LEGACY_LOOKUP_COEXISTENCE.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_RUNTIME_PAIR_LEGACY_MUTATION_COEXISTENCE.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_RUNTIME_PAIR_FORCE_COMPATIBILITY.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_RUNTIME_PAIR_MISSING_ID_COMPATIBILITY.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_RUNTIME_PAIR_EDIT_COMPATIBILITY.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_RUNTIME_PAIR_SEND_COMPATIBILITY.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_RUNTIME_PAIR_CREATION_FAILURE_COMPATIBILITY.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_RUNTIME_PAIR_CONSTRUCTOR_FAILURE_SURFACE.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_RUNTIME_PAIR_IMPORT_BOUNDARY.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_RUNTIME_PAIR_VARIABLE_SCOPE.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_RUNTIME_PAIR_NO_USE_CONTRACT.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_RUNTIME_PAIR_CREATION_IMPLEMENTATION_READINESS.md',
  'tests/fakes/community/FakeCommunityGuideRuntimePairCreation.js',
  'tests/fixtures/community/community-guide-runtime-pair-creation-cases.json',
  'tests/integration/community/communityGuideRuntimePairCreationEquivalence.test.js',
  'tests/integration/community/communityGuideRuntimePairCreationFailureSurface.test.js',
  'tests/integration/community/communityGuideRuntimePairCreationIsolation.test.js',
  'tests/integration/community/communityGuideRuntimePairCreationRollback.test.js'
]) assert.equal(fs.existsSync(path.join(root, file)), true, file);
assert.equal(require('../fixtures/community/community-guide-runtime-pair-creation-cases.json').length, 60);
console.log('Community guide runtime pair creation preparation integrity passed');
