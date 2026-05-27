const { PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');
const { bootstrapCommunity, buildSummaryEmbed } = require('../systems/communityBootstrapSystem');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('bootstrap-community')
    .setDescription('第一次建立標準社群架構、角色與權限')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageChannels)) {
      await interaction.editReply('你需要 ManageChannels 權限才能 bootstrap 社群。');
      return;
    }
    if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageChannels)) {
      await interaction.editReply('Bot 缺少 ManageChannels 權限，無法建立/修復頻道。');
      return;
    }
    const summary = await bootstrapCommunity(interaction.guild, { order: true });
    await interaction.editReply({ embeds: [buildSummaryEmbed('🏗 Community Bootstrap 完成', summary)] });
  }
};
