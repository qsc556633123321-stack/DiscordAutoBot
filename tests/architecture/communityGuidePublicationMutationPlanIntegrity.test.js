const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..');
for (const file of [
  'docs/refactor-audit/COMMUNITY_GUIDE_PUBLICATION_MUTATION_PLAN_INPUT_AUDIT.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_PUBLICATION_MUTATION_PLAN_MATRIX.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_PUBLICATION_MUTATION_PLAN_RUNTIME_READINESS.md',
  'tests/fixtures/community/community-guide-publication-mutation-plan-cases.json'
]) assert.equal(fs.existsSync(path.join(root, file)), true, file);
assert.equal(JSON.parse(fs.readFileSync(path.join(root, 'tests/fixtures/community/community-guide-publication-mutation-plan-cases.json'), 'utf8')).length, 20);
console.log('guide publication mutation plan integrity passed');
