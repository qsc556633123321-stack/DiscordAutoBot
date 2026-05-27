const { PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');
const { buildSummaryEmbed, rebuildCommunityLayout } = require('../systems/communityBootstrapSystem');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rebuild-community-layout')
    .setDescription('重新整理社群分類順序、頻道順序、權限與導覽入口')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageChannels)) {
      await interaction.editReply('你需要 ManageChannels 權限才能重整社群 Layout。');
      return;
    }
    const summary = await rebuildCommunityLayout(interaction.guild);
    await interaction.editReply({ embeds: [buildSummaryEmbed('🧱 社群 Layout 重整完成', summary)] });
  }
};
