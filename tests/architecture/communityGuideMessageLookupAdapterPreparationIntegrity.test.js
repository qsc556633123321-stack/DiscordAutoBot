const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..', '..');

for (const file of [
  'docs/refactor-audit/COMMUNITY_GUIDE_MESSAGE_LOOKUP_ADAPTER_PREPARATION_BLOCKERS.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_MESSAGE_LOOKUP_INFRASTRUCTURE_PATTERN_AUDIT.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_MESSAGE_LOOKUP_ADAPTER_DEPENDENCY_DECISION.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_MESSAGE_LOOKUP_GUILD_ID_SEMANTICS.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_MESSAGE_LOOKUP_CHANNEL_RESOLUTION.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_MESSAGE_LOOKUP_FETCH_SEMANTICS.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_MESSAGE_LOOKUP_SKIPPED_OWNERSHIP.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_MESSAGE_LOOKUP_FORCE_OWNERSHIP.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_MESSAGE_LOOKUP_CHANNEL_FAILURE_MAPPING.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_MESSAGE_LOOKUP_NO_DOUBLE_LOOKUP_RULE.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_MESSAGE_LOOKUP_SUCCESS_MAPPING.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_MESSAGE_LOOKUP_UNAVAILABLE_MAPPING.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_MESSAGE_LOOKUP_DISCORD_ADAPTER_CONTRACT.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_MESSAGE_LOOKUP_MUTATION_ADAPTER_INTERACTION.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_MESSAGE_LOOKUP_ADAPTER_IMPLEMENTATION_READINESS.md',
  'tests/fakes/community/FakeGuideMessageLookupDiscordResources.js'
]) assert.equal(fs.existsSync(path.join(root, file)), true, file);
const cases = JSON.parse(fs.readFileSync(path.join(root, 'tests/fixtures/community/community-guide-message-lookup-adapter-cases.json'), 'utf8'));
assert.equal(cases.length, 40);
assert.equal(fs.existsSync(path.join(root, 'src/infrastructure/community/GuidePublicationMessageLookupDiscordAdapter.js')), false);
console.log('Guide message lookup adapter preparation integrity passed');
