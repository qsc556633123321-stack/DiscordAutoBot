const { PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');
const { getMemberGuardSettings, getRecentBlockedCount, getRecentJoinCount } = require('../systems/memberGuard');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('memberguard-status')
    .setDescription('查看 Member Guard 狀態')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    if (!interaction.guild) {
      await interaction.reply({ content: '這個指令只能在伺服器內使用。', ephemeral: true });
      return;
    }

    const settings = getMemberGuardSettings(interaction.guild.id);
    await interaction.reply({
      content:
        `Member Guard 狀態\n\n` +
        `啟用：${settings.enabled}\n` +
        `safe_mode：${settings.safeMode}\n` +
        `新帳號限制天數：${settings.newAccountDays}\n` +
        `最近 10 分鐘加入人數：${getRecentJoinCount(interaction.guild.id)}\n` +
        `最近 10 分鐘阻擋次數：${getRecentBlockedCount(interaction.guild.id)}`,
      ephemeral: true
    });
  }
};
