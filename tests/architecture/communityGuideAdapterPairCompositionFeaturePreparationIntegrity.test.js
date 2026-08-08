const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..', '..');

for (const file of [
  'docs/refactor-audit/COMMUNITY_GUIDE_ADAPTER_PAIR_COMPOSITION_FEATURE_PREPARATION_BLOCKERS.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_ADAPTER_PAIR_COMPOSITION_FEATURE_PATTERN_AUDIT.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_ADAPTER_PAIR_COMPOSITION_NECESSITY.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_ADAPTER_PAIR_FACTORY_INJECTION.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_ADAPTER_PAIR_COMPOSITION_STATE.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_ADAPTER_PAIR_INVOCATION_OWNERSHIP.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_RUNTIME_PAIR_CREATOR_DEPENDENCY.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_COMPOSITION_FAILURE_HANDOFF_OWNERSHIP.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_COMPOSITION_PERSISTENCE_HANDOFF_OWNERSHIP.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_COMPOSITION_ROADMAP_OWNERSHIP.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_PAIR_CREATOR_CONTRACT.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_COMPOSITION_ROLLBACK_ANALYSIS.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_ADAPTER_PAIR_COMPOSITION_FEATURE_READINESS.md',
  'tests/fakes/community/FakeCommunityGuideAdapterPairCompositionFeature.js'
]) assert.equal(fs.existsSync(path.join(root, file)), true, file);
assert.equal(fs.existsSync(path.join(root, 'src/composition/communityGuideAdapterPairFeature.js')), true);
console.log('Guide adapter pair composition feature preparation integrity passed');
