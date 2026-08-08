const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..', '..');
for (const file of [
  'docs/refactor-audit/COMMUNITY_GUIDE_MUTATION_PLAN_BRANCH_RUNTIME_INPUT_AUDIT.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_MUTATION_PLAN_SKIP_RUNTIME_DECISION.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_MUTATION_PLAN_BRANCH_RUNTIME_OBSERVABLE_COMPATIBILITY.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_MUTATION_PLAN_BRANCH_RUNTIME_ROLLBACK.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_MUTATION_PLAN_BRANCH_RUNTIME_INTEGRATION_BLOCKERS.md',
  'tests/community/communityGuideMutationPlanBranchRuntimePreIntegrationBaseline.test.js',
  'tests/community/communityGuideMutationPlanBranchRuntimeIntegration.test.js',
  'tests/community/communityGuideMutationPlanBranchRuntimeDifferentialCompatibility.test.js',
  'tests/community/communityGuideMutationPlanBranchRuntimeCallCount.test.js',
  'tests/community/communityGuideMutationPlanBranchPartialFailureNonRegression.test.js',
  'tests/community/communityGuideMutationPlanBranchPersistenceNonRegression.test.js',
  'tests/community/communityRoadmapNonRegressionAfterGuideMutationPlanBranchIntegration.test.js'
]) assert.equal(fs.existsSync(path.join(root, file)), true, file);
const runtime = fs.readFileSync(path.join(root, 'src/systems/communityConcierge.js'), 'utf8');
assert.equal(runtime.includes('Unsupported Guide publication operation'), true);
console.log('community Guide mutation Plan branch runtime integration integrity passed');
