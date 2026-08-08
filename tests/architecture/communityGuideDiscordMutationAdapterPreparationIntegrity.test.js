const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..', '..');

for (const file of [
  'docs/refactor-audit/COMMUNITY_GUIDE_DISCORD_MUTATION_ADAPTER_PREPARATION_BLOCKERS.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_DISCORD_MUTATION_INFRASTRUCTURE_PATTERN_AUDIT.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_DISCORD_MUTATION_LEGACY_RESOURCE_AUDIT.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_DISCORD_MUTATION_ADAPTER_DEPENDENCY_DECISION.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_DISCORD_MUTATION_GUILD_RESOLUTION.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_DISCORD_MUTATION_CHANNEL_LOOKUP.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_DISCORD_MUTATION_MESSAGE_LOOKUP.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_DISCORD_MUTATION_EDIT_FAILURE_MAPPING.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_DISCORD_MUTATION_SEND_FAILURE_MAPPING.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_DISCORD_MUTATION_SUCCESS_MAPPING.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_DISCORD_MUTATION_ADAPTER_CONTRACT.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_DISCORD_MUTATION_ADAPTER_IMPLEMENTATION_READINESS.md',
  'tests/fakes/community/FakeGuideDiscordResources.js',
  'tests/fixtures/community/community-guide-discord-mutation-adapter-cases.json'
]) assert.equal(fs.existsSync(path.join(root, file)), true, file);
const cases = JSON.parse(fs.readFileSync(path.join(root, 'tests/fixtures/community/community-guide-discord-mutation-adapter-cases.json'), 'utf8'));
assert.ok(cases.length >= 40);
assert.equal(new Set(cases.map((item) => item.id)).size, cases.length);
console.log('Guide Discord mutation adapter preparation integrity passed');
