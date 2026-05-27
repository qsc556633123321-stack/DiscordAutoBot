const { PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');
const { buildSummaryEmbed, repairChannelPermissions } = require('../systems/communityBootstrapSystem');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('repair-channel-permissions')
    .setDescription('依標準社群架構修復分類與頻道權限')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageChannels)) {
      await interaction.editReply('你需要 ManageChannels 權限才能修復頻道權限。');
      return;
    }
    const summary = await repairChannelPermissions(interaction.guild);
    await interaction.editReply({ embeds: [buildSummaryEmbed('🧰 頻道權限修復完成', summary)] });
  }
};
