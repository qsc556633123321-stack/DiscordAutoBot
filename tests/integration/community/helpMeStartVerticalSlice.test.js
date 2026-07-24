const assert = require('node:assert/strict');
const { createHelpMeStartFeature } = require('../../../src/composition/community/helpMeStartFeature');
const { createHelpMeStartCommand } = require('../../../src/presentation/commands/helpMeStartCommand');
const { createDiscordGuildChannelReader } = require('../../../src/infrastructure/community/discordGuildChannelReader');
const { createFakeGuild, createFakeTextGenerator } = require('../../fixtures/helpMeStartFakes');

async function main() {
  const guild = createFakeGuild();
  const featureFactory = ({ guild: activeGuild }) => createHelpMeStartFeature({
    guildChannelReader: createDiscordGuildChannelReader({ guildResolver: () => activeGuild }),
    conciergeTextGenerator: createFakeTextGenerator({ value: 'vertical text' })
  });
  const command = createHelpMeStartCommand({ featureFactory });
  const calls = [];
  await command.execute({
    guild,
    options: { getString: (name) => ({ game: 'TFT', style: 'rank', online_time: 'late' }[name]) },
    deferReply: async (payload) => calls.push(['defer', payload]),
    editReply: async (payload) => calls.push(['edit', payload])
  });
  assert.deepEqual(calls[0], ['defer', { ephemeral: true }]);
  const embed = calls[1][1].embeds[0].toJSON();
  assert.equal(embed.description, 'vertical text');
  assert.deepEqual(embed.fields[1], { name: '建議身分組', value: '🎮 遊戲玩家\n🧑‍🤝‍🧑 找隊友通知', inline: false });
  assert.match(embed.timestamp, /^\d{4}-\d{2}-\d{2}T/);
  console.log('Help-me-start vertical slice tests passed.');
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
