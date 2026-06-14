const { PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');
const { permissions } = require('../../adapters/legacy/legacyCommandAdapters');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('check-guest-visibility')
    .setDescription('以 @everyone 與訪客角度檢查頻道外漏')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    try {
      if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageChannels)) {
        await interaction.editReply('你需要 ManageChannels 權限才能檢查 Guest Gate。');
        return;
      }
      const result = await permissions.inspectGuestGate(interaction.guild);
      if (!result.ok) {
        await interaction.editReply(`Guest Gate inspection failed: ${result.error.message}`);
        return;
      }
      await interaction.editReply({
        embeds: [permissions.buildGuestVisibilityEmbed(result.data.visibility, result.data.onboarding)]
      });
    } catch (error) {
      console.error('[GuestGate] visibility check failed:', error);
      await interaction.editReply(`⚠️ Guest Gate 檢查失敗：${error.message}`);
    }
  }
};
