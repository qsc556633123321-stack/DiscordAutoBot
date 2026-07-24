const assert = require('node:assert/strict');
const { createDiscordGuildChannelReader } = require('../../../src/infrastructure/community/discordGuildChannelReader');
const { createLegacyConciergeTextGenerator } = require('../../../src/infrastructure/community/legacyConciergeTextGenerator');
const { createFakeGuild, standardChannels } = require('../../fixtures/helpMeStartFakes');

async function main() {
  const guild = createFakeGuild();
  const reader = createDiscordGuildChannelReader({ guildResolver: (id) => id === guild.id ? guild : null });
  assert.deepEqual(reader.listTextChannels(guild.id), standardChannels.map((channel) => ({
    id: channel.id,
    name: channel.name,
    mention: `${channel}`,
    isTextBased: Boolean(channel.isTextBased())
  })));
  assert.throws(() => reader.listTextChannels('missing'), /Guild is required/);

  const calls = [];
  const adapter = createLegacyConciergeTextGenerator({ generator: async (...args) => { calls.push(args); return 'generated'; } });
  assert.equal(await adapter.generate('help_me_start', { guildName: 'Test Guild' }, 'fallback'), 'generated');
  assert.deepEqual(calls, [['help_me_start', { guildName: 'Test Guild' }, 'fallback']]);
  console.log('Help-me-start infrastructure adapter tests passed.');
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
