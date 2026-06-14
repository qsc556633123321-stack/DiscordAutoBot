const { PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');
const { permissions } = require('../../adapters/legacy/legacyCommandAdapters');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('check-role-visibility')
    .setDescription('檢查指定角色依矩陣與 Discord 實際可見的分類及頻道')
    .addRoleOption((option) => option.setName('role').setDescription('要檢查的角色').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    try {
      const role = interaction.options.getRole('role');
      const report = permissions.inspectRoleVisibility(interaction.guild, role);
      await interaction.editReply({ embeds: [permissions.buildRoleVisibilityEmbed(report)] });
    } catch (error) {
      console.error('[Permissions] role visibility check failed:', error);
      await interaction.editReply(`⚠️ 檢查失敗：${error.message}`);
    }
  }
};
