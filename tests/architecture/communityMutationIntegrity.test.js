const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..');
for (const file of [
  'docs/refactor-audit/COMMUNITY_MUTATION_FUNCTION_INVENTORY.md',
  'docs/refactor-audit/COMMUNITY_MUTATION_CALL_GRAPH.md',
  'docs/refactor-audit/COMMUNITY_MUTATION_WRITE_TARGETS.md',
  'docs/refactor-audit/COMMUNITY_MUTATION_SIDE_EFFECT_MATRIX.md',
  'docs/refactor-audit/COMMUNITY_MUTATION_DATA_FLOW.md',
  'docs/refactor-audit/COMMUNITY_MUTATION_RUNTIME_BOUNDARY.md',
  'docs/refactor-audit/COMMUNITY_MUTATION_READINESS.md',
  'docs/refactor-audit/COMMUNITY_MUTATION_CHARACTERIZATION_COVERAGE.md'
]) assert.equal(fs.existsSync(path.join(root, file)), true, `missing ${file}`);
console.log('community mutation integrity passed');
