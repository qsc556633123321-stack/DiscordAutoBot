const { PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');
const {
  buildGuestVisibilityEmbed,
  checkGuestVisibility,
  checkNativeOnboardingReferences
} = require('../systems/guestGate');

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
      const nativeOnboarding = await checkNativeOnboardingReferences(interaction.guild);
      await interaction.editReply({
        embeds: [buildGuestVisibilityEmbed(checkGuestVisibility(interaction.guild), nativeOnboarding)]
      });
    } catch (error) {
      console.error('[GuestGate] visibility check failed:', error);
      await interaction.editReply(`⚠️ Guest Gate 檢查失敗：${error.message}`);
    }
  }
};
