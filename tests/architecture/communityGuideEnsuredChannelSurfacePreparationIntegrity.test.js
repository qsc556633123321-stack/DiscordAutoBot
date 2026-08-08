const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..', '..');

for (const file of [
  'docs/refactor-audit/COMMUNITY_GUIDE_ENSURED_CHANNEL_SURFACE_BLOCKERS.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_ENSURED_CHANNEL_RETURN_AUDIT.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_LEGACY_CHANNEL_CONSUMER_SURFACE.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_RESOURCE_SESSION_CHANNEL_CONTRACT.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_PAIR_CONSTRUCTOR_CHAIN.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_ENSURED_CHANNEL_COMPATIBILITY_MATRIX.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_SUCCESSFUL_ENSURE_INVARIANT.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_EXISTING_CHANNEL_SURFACE.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_NEW_CHANNEL_SURFACE.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_CHANNEL_FAILURE_TIMING.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_VALID_CHANNEL_ZERO_THROW_PROOF.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_INVALID_CHANNEL_REACHABILITY.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_CHANNEL_TEST_DOUBLE_COMPATIBILITY.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_PAIR_CONSTRUCTOR_VALIDATION_DECISION.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_RUNTIME_PAIR_CREATION_FINAL_READINESS.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_RUNTIME_PAIR_CREATION_APPROVED_DIFF.md',
  'tests/fixtures/community/community-guide-ensured-channel-surface-cases.json',
  'tests/infrastructure/community/guidePublication/guidePublicationEnsuredChannelConstructorSurface.test.js',
  'tests/integration/community/communityGuideEnsuredChannelLegacyCompatibility.test.js',
  'tests/integration/community/communityGuideEnsuredChannelFailureTiming.test.js'
]) assert.equal(fs.existsSync(path.join(root, file)), true, file);
assert.equal(require('../fixtures/community/community-guide-ensured-channel-surface-cases.json').length, 40);
console.log('Guide ensured channel surface preparation integrity passed');
