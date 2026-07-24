const assert = require('node:assert/strict');
const { GUIDE_CONTENT, createCommunityGuideContentReader } = require('../../../src/infrastructure/community/communityGuideContentReader');
const { createDiscordGuideGuildFactsReader } = require('../../../src/infrastructure/community/discordGuideGuildFactsReader');
const { createJsonGuideStatusReader } = require('../../../src/infrastructure/community/jsonGuideStatusReader');
const baseline = require('../../fixtures/communityGuideLegacyBaseline');

async function main() {
  assert.deepEqual(await createCommunityGuideContentReader().readGuideContent(), GUIDE_CONTENT);
  const facts = await createDiscordGuideGuildFactsReader({ guildResolver: () => ({ ...baseline.guildFacts, channels: { cache: new Map(baseline.guildFacts.channels.map((channel) => [channel.id, channel])) } }) }).readGuideGuildFacts('guild-1');
  assert.deepEqual(facts, baseline.guildFacts);
  assert.deepEqual(await createJsonGuideStatusReader({ readFile: () => JSON.stringify({ 'guild-1': baseline.statusRecord }) }).readGuideStatus('guild-1'), baseline.statusRecord);
  assert.deepEqual(await createJsonGuideStatusReader({ readFile: () => '{' }).readGuideStatus('guild-1'), {});
  assert.deepEqual(await createJsonGuideStatusReader({ readFile: () => { throw new Error('missing'); } }).readGuideStatus('guild-1'), {});
  console.log('Community Guide reader tests passed.');
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
