const { PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');
const { buildSummaryEmbed, repairChannelPermissions } = require('../systems/communityBootstrapSystem');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('repair-channel-permissions')
    .setDescription('依標準 public / role restricted / admin 權限架構修復頻道權限')
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
      await interaction.editReply('你需要 ManageChannels 權限才能修復頻道權限。');
      return;
    }
    if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageChannels)) {
      await interaction.editReply('Bot 缺少 ManageChannels 權限，無法修復頻道權限。');
      return;
    }

    const mode = interaction.options.getString('mode') || 'preview';
    const summary = await repairChannelPermissions(interaction.guild, { mode });
    await interaction.editReply({ embeds: [buildSummaryEmbed('🔧 Repair Channel Permissions', summary)] });
  }
};
