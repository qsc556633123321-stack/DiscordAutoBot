const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..', '..');
for (const file of [
  'docs/refactor-audit/COMMUNITY_GUIDE_DISCORD_MUTATION_EXECUTION_INPUT_AUDIT.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_DISCORD_EXECUTION_DATA_INVENTORY.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_DISCORD_MUTATION_EXECUTION_CONTRACT.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_DISCORD_EXECUTION_MAPPING_MATRIX.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_DISCORD_MUTATION_PORT_CANDIDATES.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_DISCORD_EXECUTION_HELPER_DECISION.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_DISCORD_MUTATION_EXECUTION_RUNTIME_READINESS.md',
  'tests/fixtures/community/community-guide-discord-execution-contract-cases.json'
]) assert.equal(fs.existsSync(path.join(root, file)), true, file);
assert.equal(JSON.parse(fs.readFileSync(path.join(root, 'tests/fixtures/community/community-guide-discord-execution-contract-cases.json'), 'utf8')).length, 20);
console.log('community Guide Discord mutation execution preparation integrity passed');
