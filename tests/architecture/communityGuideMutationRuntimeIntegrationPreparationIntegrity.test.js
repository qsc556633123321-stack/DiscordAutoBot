const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..');
for (const file of [
  'docs/refactor-audit/COMMUNITY_GUIDE_MUTATION_RUNTIME_INTEGRATION_PREPARATION_INPUT_AUDIT.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_MUTATION_RUNTIME_DATA_DEPENDENCY_INVENTORY.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_MUTATION_PLAN_DECISION_TIMING.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_MUTATION_PLAN_EXECUTION_BRIDGE_CANDIDATES.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_MUTATION_RUNTIME_TO_PLAN_MAPPING.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_MUTATION_BRANCH_REPLACEMENT_MODEL.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_MUTATION_SHADOW_COMPUTATION_DECISION.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_MUTATION_RUNTIME_INTEGRATION_OBSERVABLE_PREDICTION.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_MUTATION_PLAN_BRANCH_CONTROL_ROLLBACK.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_MUTATION_RUNTIME_INTEGRATION_PREPARATION_READINESS.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_MUTATION_RUNTIME_INTEGRATION_PREPARATION_BLOCKERS.md',
  'tests/fixtures/community/community-guide-mutation-runtime-integration-preparation-cases.json'
]) assert.equal(fs.existsSync(path.join(root, file)), true, file);
const cases = require('../fixtures/community/community-guide-mutation-runtime-integration-preparation-cases.json');
assert.equal(cases.length, 20);
assert.equal(cases.some((item) => item.id === 'RI-B03' && item.operation === 'SendNewMessage'), true);
assert.equal(cases.some((item) => item.id === 'RI-B12' && item.fetch === 'reject'), true);
console.log('community Guide mutation runtime integration preparation integrity passed');
