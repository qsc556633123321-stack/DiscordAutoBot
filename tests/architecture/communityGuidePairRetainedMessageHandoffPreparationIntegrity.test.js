const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
const required = [
  'tests/fakes/community/FakeGuidePublicationAdapterPairWithMessageHandoff.js',
  'tests/fixtures/community/community-guide-pair-retained-message-handoff-cases.json',
  'tests/integration/community/communityGuidePairRetainedMessageHandoffCandidate.test.js',
  'tests/integration/community/communityGuidePairRetainedMessageIdentityContinuity.test.js',
  'tests/integration/community/communityGuidePairRetainedMessageNoSecondFetch.test.js',
  'tests/architecture/communityGuidePairRetainedMessageSurfaceNarrowness.test.js',
  'tests/architecture/communityGuidePairRetainedMessageHandoffNotImplemented.test.js',
  'tests/architecture/communityGuidePairRetainedMessageHandoffPreparationBoundary.test.js',
  'tests/architecture/communityGuidePairRetainedMessageHandoffPreparationDiffGuard.test.js',
  'docs/refactor-audit/COMMUNITY_GUIDE_PAIR_RETAINED_MESSAGE_HANDOFF_PREPARATION_BLOCKERS.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_PAIR_CURRENT_PUBLIC_SURFACE.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_PAIR_HANDOFF_SESSION_ACCESSOR_AUDIT.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_PAIR_RETAINED_MESSAGE_HANDOFF_CANDIDATES.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_PAIR_RETAINED_MESSAGE_CAPABILITY_NAMING.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_PAIR_RETAINED_MESSAGE_DELEGATE_CONTRACT.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_PAIR_SESSION_EXPOSURE_DECISION.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_PAIR_RAW_MESSAGE_BOUNDARY.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_PAIR_HANDOFF_COMPOSITION_PASS_THROUGH.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_PAIR_HANDOFF_APPLICATION_PURITY.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_PAIR_HANDOFF_FUTURE_LOOKUP_FLOW.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_PAIR_HANDOFF_AVAILABLE_INVARIANT.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_PAIR_HANDOFF_UNAVAILABLE_INVARIANT.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_PAIR_HANDOFF_FRESH_PAIR.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_PAIR_HANDOFF_REPEATED_LOOKUP.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_PAIR_HANDOFF_ISOLATION.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_PAIR_RETAINED_MESSAGE_HANDOFF_IMPLEMENTATION_READINESS.md'
];

for (const file of required) assert.equal(fs.existsSync(path.join(root, file)), true, `${file} must exist`);
const cases = JSON.parse(fs.readFileSync(path.join(root, required[1]), 'utf8'));
assert.equal(cases.length, 60);
console.log('Community guide Pair retained-message handoff preparation integrity passed');
