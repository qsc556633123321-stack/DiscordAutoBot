const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..', '..');

for (const file of [
  'docs/refactor-audit/COMMUNITY_GUIDE_DISCORD_MUTATION_PORT_INPUT_AUDIT.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_DISCORD_MUTATION_RESOURCE_IDENTITY.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_DISCORD_MUTATION_LOOKUP_OWNERSHIP.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_DISCORD_MUTATION_PORT_CONTRACT.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_DISCORD_MUTATION_PORT_RESULT_CONTRACT.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_DISCORD_MUTATION_PORT_FAILURE_CONTRACT.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_DISCORD_MUTATION_PORT_COMPATIBILITY_MATRIX.md',
  'docs/refactor-audit/COMMUNITY_GENERIC_DISCORD_MESSAGE_PORT_DECISION.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_DISCORD_MUTATION_PORT_IMPLEMENTATION_READINESS.md',
  'tests/fixtures/community/community-guide-discord-mutation-port-cases.json'
]) assert.equal(fs.existsSync(path.join(root, file)), true, file);

const cases = JSON.parse(fs.readFileSync(path.join(root, 'tests/fixtures/community/community-guide-discord-mutation-port-cases.json'), 'utf8'));
assert.equal(cases.length, 30);
assert.equal(new Set(cases.map((item) => item.id)).size, 30);
console.log('community Guide Discord mutation port preparation integrity passed');
