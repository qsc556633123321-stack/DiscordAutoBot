const { PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');
const { getMemberGuardSettings, getRecentBlockedCount, getRecentJoinCount } = require('../systems/memberGuard');
const { safeDeferReply, safeEditReply } = require('../utils/interactionReplies');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('memberguard-status')
    .setDescription('查看 Member Guard 狀態')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    await safeDeferReply(interaction, { ephemeral: true });

    try {
      if (!interaction.guild) {
        await safeEditReply(interaction, '這個指令只能在伺服器內使用。');
        return;
      }

      const settings = getMemberGuardSettings(interaction.guild.id);
      await safeEditReply(interaction,
        `Member Guard 狀態\n\n` +
        `啟用：${settings.enabled}\n` +
        `safe_mode：${settings.safeMode}\n` +
        `新帳號限制天數：${settings.newAccountDays}\n` +
        `最近 10 分鐘加入人數：${getRecentJoinCount(interaction.guild.id)}\n` +
        `最近 10 分鐘阻擋次數：${getRecentBlockedCount(interaction.guild.id)}`
      );
    } catch (error) {
      console.error('memberguard-status failed:', error);
      await safeEditReply(interaction, '⚠️ 執行失敗，請查看 console logs。');
    }
  }
};
