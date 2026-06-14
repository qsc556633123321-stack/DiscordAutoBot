const { PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');
const { permissions } = require('../adapters/legacy/legacyCommandAdapters');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('debug-permissions')
    .setDescription('顯示頻道的 Permission Matrix 與 Discord 實際 overwrite')
    .addChannelOption((option) => option.setName('channel').setDescription('要檢查的頻道，預設目前頻道'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    try {
      const channel = interaction.options.getChannel('channel') || interaction.channel;
      const report = permissions.debugPermissions(interaction.guild, channel);
      await interaction.editReply({ embeds: [permissions.buildDebugPermissionsEmbed(report)] });
    } catch (error) {
      console.error('[Permissions] debug failed:', error);
      await interaction.editReply(`⚠️ 權限除錯失敗：${error.message}`);
    }
  }
};
