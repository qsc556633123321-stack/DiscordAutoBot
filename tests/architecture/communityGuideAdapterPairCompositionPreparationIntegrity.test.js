const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..', '..');

for (const file of [
  'docs/refactor-audit/COMMUNITY_GUIDE_ADAPTER_PAIR_COMPOSITION_PREPARATION_BLOCKERS.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_ADAPTER_PAIR_PRODUCTION_COMPONENT_AUDIT.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_ADAPTER_PAIR_COMPOSITION_PATTERN_AUDIT.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_ADAPTER_PAIR_OWNERSHIP_MATRIX.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_ADAPTER_PAIR_CREATION_CANDIDATES.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_ADAPTER_PAIR_SESSION_ENCAPSULATION.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_ADAPTER_PAIR_LIFETIME.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_ADAPTER_PAIR_RUNTIME_ORDERING.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_ADAPTER_PAIR_SKIP_FLOW.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_ADAPTER_PAIR_EDIT_FLOW.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_ADAPTER_PAIR_SEND_FLOW.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_ADAPTER_PAIR_FAILURE_ORDERING.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_MUTATION_RESULT_RUNTIME_HANDOFF.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_ADAPTER_PAIR_PERSISTENCE_ORDERING.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_ADAPTER_PAIR_ROADMAP_ORDERING.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_ADAPTER_PAIR_ROLLBACK_BOUNDARY.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_ADAPTER_PAIR_COMPOSITION_READINESS.md',
  'tests/fakes/community/FakeGuidePublicationAdapterPairFactory.js'
]) assert.equal(fs.existsSync(path.join(root, file)), true, file);
const cases = JSON.parse(fs.readFileSync(path.join(root, 'tests/fixtures/community/community-guide-adapter-pair-cases.json'), 'utf8'));
assert.equal(cases.length, 60);
console.log('Guide adapter pair composition preparation integrity passed');
