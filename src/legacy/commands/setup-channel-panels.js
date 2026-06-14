const {
  EmbedBuilder,
  PermissionFlagsBits,
  SlashCommandBuilder
} = require('discord.js');
const channelPanelService = require('../../services/community/channelPanelService');

function summarize(results) {
  const counts = results.reduce((acc, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1;
    return acc;
  }, {});

  return [
    `建立：${counts.created || 0}`,
    `更新：${counts.refreshed || 0}`,
    `略過：${counts.skipped || 0}`,
    `失敗：${counts.failed || 0}`
  ].join('\n');
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup-channel-panels')
    .setDescription('在主要頻道建立或更新公告與操作面板')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addStringOption((option) =>
      option
        .setName('mode')
        .setDescription('建立、更新或強制重發面板')
        .setRequired(true)
        .addChoices(
          { name: 'create', value: 'create' },
          { name: 'refresh', value: 'refresh' },
          { name: 'force', value: 'force' }
        )
    )
    .addStringOption((option) =>
      option
        .setName('target')
        .setDescription('要處理哪些頻道')
        .setRequired(true)
        .addChoices(
          { name: 'all', value: 'all' },
          { name: 'current', value: 'current' },
          { name: 'game', value: 'game' },
          { name: 'support', value: 'support' },
          { name: 'info', value: 'info' }
        )
    ),

  async execute(interaction) {
    if (!interaction.guild) {
      await interaction.reply({ content: '這個指令只能在伺服器中使用。', ephemeral: true });
      return;
    }

    if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageChannels)) {
      await interaction.reply({ content: '你需要 ManageChannels 權限才能設定頻道面板。', ephemeral: true });
      return;
    }

    if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.SendMessages)) {
      await interaction.reply({ content: 'Bot 缺少 SendMessages 權限，無法發送面板。', ephemeral: true });
      return;
    }

    await interaction.deferReply({ ephemeral: true });

    try {
      const mode = interaction.options.getString('mode');
      const target = interaction.options.getString('target');
      const result = await channelPanelService.setup({
        client: interaction.client,
        guild: interaction.guild,
        currentChannel: interaction.channel,
        mode,
        target
      });
      if (!result.ok) throw new Error(result.error.message);
      const results = result.data;

      const details = results.slice(0, 15).map((item) => (
        `• #${item.channel}：${item.status}${item.reason ? `（${item.reason}）` : ''}`
      )).join('\n') || '沒有找到符合條件的主要頻道。';

      const embed = new EmbedBuilder()
        .setColor(0x2f80ed)
        .setTitle('頻道面板設定完成')
        .setDescription(`mode：${mode}\ntarget：${target}`)
        .addFields(
          { name: '摘要', value: summarize(results), inline: true },
          { name: '細節', value: details.slice(0, 1024) }
        )
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('設定頻道面板失敗：', error);
      await interaction.editReply(`設定頻道面板失敗：${error.message}`);
    }
  }
};
