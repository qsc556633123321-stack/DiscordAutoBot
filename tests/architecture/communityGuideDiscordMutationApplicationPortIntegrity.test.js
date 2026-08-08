const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..', '..');

for (const file of [
  'docs/refactor-audit/COMMUNITY_GUIDE_DISCORD_MUTATION_APPLICATION_PORT_BLOCKERS.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_DISCORD_MUTATION_APPLICATION_PORT_PATTERN_AUDIT.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_DISCORD_MUTATION_ADAPTER_READINESS.md',
  'src/application/community/ports/GuidePublicationMessageMutationPort.js',
  'src/application/community/guideDiscordMutation/GuidePublicationMessageEditRequest.js',
  'src/application/community/guideDiscordMutation/GuidePublicationMessageSendRequest.js',
  'src/application/community/guideDiscordMutation/GuidePublicationMessageMutationResult.js',
  'src/application/community/guideDiscordMutation/GuidePublicationMessageMutationFailure.js',
  'tests/fakes/community/FakeGuidePublicationMessageMutationPort.js',
  'tests/fixtures/community/community-guide-discord-mutation-port-cases.json'
]) assert.equal(fs.existsSync(path.join(root, file)), true, file);
assert.equal(JSON.parse(fs.readFileSync(path.join(root, 'tests/fixtures/community/community-guide-discord-mutation-port-cases.json'), 'utf8')).length, 30);
console.log('Guide Discord mutation Application port integrity passed');
