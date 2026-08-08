const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..');
for (const file of [
  'docs/refactor-audit/COMMUNITY_GUIDE_PUBLICATION_MUTATION_EXECUTION_INPUT_AUDIT.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_PUBLICATION_EXECUTION_OPERATION_INVENTORY.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_PUBLICATION_EXECUTION_BRANCH_MATRIX.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_PUBLICATION_EXECUTION_OBSERVABLE_CONTRACT.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_PUBLICATION_PLAN_EXECUTION_MAPPING.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_PUBLICATION_EXECUTION_BOUNDARY_ANALYSIS.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_PUBLICATION_EXECUTION_RUNTIME_READINESS.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_PUBLICATION_EXECUTION_CHARACTERIZATION_COVERAGE.md',
  'tests/helpers/createCommunityGuidePublicationExecutionHarness.js',
  'tests/fixtures/community/community-guide-publication-execution-cases.json'
]) assert.equal(fs.existsSync(path.join(root, file)), true, file);
assert.equal(JSON.parse(fs.readFileSync(path.join(root, 'tests/fixtures/community/community-guide-publication-execution-cases.json'), 'utf8')).length, 30);
console.log('community Guide publication execution characterization integrity passed');
