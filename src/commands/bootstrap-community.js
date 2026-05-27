const { PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');
const { bootstrapCommunity, buildSummaryEmbed } = require('../systems/communityBootstrapSystem');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('bootstrap-community')
    .setDescription('建立或修復標準社群結構，重複執行不會重複建立')
    .addStringOption((option) =>
      option
        .setName('mode')
        .setDescription('preview 只預覽，execute 才執行')
        .setRequired(false)
        .addChoices(
          { name: 'preview', value: 'preview' },
          { name: 'execute', value: 'execute' }
        ))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageChannels)) {
      await interaction.editReply('你需要 ManageChannels 權限才能 bootstrap 社群。');
      return;
    }
    if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageChannels)) {
      await interaction.editReply('Bot 缺少 ManageChannels 權限，無法建立或修復頻道。');
      return;
    }

    const mode = interaction.options.getString('mode') || 'preview';
    const summary = await bootstrapCommunity(interaction.guild, { mode, order: true });
    await interaction.editReply({ embeds: [buildSummaryEmbed('🧱 Community Bootstrap', summary)] });
  }
};
