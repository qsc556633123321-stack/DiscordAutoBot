const { PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');
const { applyGuestLockdownPermissions, getMemberGuardSettings, updateMemberGuardSettings } = require('../systems/memberGuard');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('memberguard-settings')
    .setDescription('設定新人安全防護與 safe mode')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addBooleanOption((option) => option.setName('enabled').setDescription('啟用 Member Guard'))
    .addBooleanOption((option) => option.setName('guest_lockdown').setDescription('新人加入只給訪客身分組'))
    .addIntegerOption((option) => option.setName('new_account_days').setDescription('新帳號限制天數').setMinValue(0).setMaxValue(90))
    .addIntegerOption((option) => option.setName('new_account_timeout_minutes').setDescription('違規 timeout 分鐘').setMinValue(1).setMaxValue(10080))
    .addBooleanOption((option) => option.setName('block_everyone_mentions').setDescription('阻擋 @everyone / @here'))
    .addBooleanOption((option) => option.setName('block_role_mentions').setDescription('阻擋 ping 管理員或高權限身分組'))
    .addIntegerOption((option) => option.setName('join_burst_limit').setDescription('短時間加入人數門檻').setMinValue(2).setMaxValue(100))
    .addIntegerOption((option) => option.setName('join_burst_window_seconds').setDescription('Join burst 偵測秒數').setMinValue(10).setMaxValue(3600))
    .addBooleanOption((option) => option.setName('safe_mode').setDescription('手動開關 safe mode')),

  async execute(interaction) {
    if (!interaction.guild) {
      await interaction.reply({ content: '這個指令只能在伺服器內使用。', ephemeral: true });
      return;
    }
    if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageGuild)) {
      await interaction.reply({ content: '你需要 ManageGuild 權限才能設定 Member Guard。', ephemeral: true });
      return;
    }

    const map = {
      enabled: 'enabled',
      guest_lockdown: 'guestLockdown',
      new_account_days: 'newAccountDays',
      new_account_timeout_minutes: 'newAccountTimeoutMinutes',
      block_everyone_mentions: 'blockEveryoneMentions',
      block_role_mentions: 'blockRoleMentions',
      join_burst_limit: 'joinBurstLimit',
      join_burst_window_seconds: 'joinBurstWindowSeconds',
      safe_mode: 'safeMode'
    };
    const patch = {};
    for (const [optionName, key] of Object.entries(map)) {
      const value = optionName.includes('days') || optionName.includes('minutes') || optionName.includes('limit') || optionName.includes('seconds')
        ? interaction.options.getInteger(optionName)
        : interaction.options.getBoolean(optionName);
      if (value !== null) patch[key] = value;
    }

    const settings = Object.keys(patch).length
      ? updateMemberGuardSettings(interaction.guild.id, patch)
      : getMemberGuardSettings(interaction.guild.id);
    const lockdownResult = settings.guestLockdown
      ? await applyGuestLockdownPermissions(interaction.guild)
      : null;

    await interaction.reply({
      content:
        `Member Guard 設定：\n` +
        `enabled：${settings.enabled}\n` +
        `guest_lockdown：${settings.guestLockdown}\n` +
        `new_account_days：${settings.newAccountDays}\n` +
        `new_account_timeout_minutes：${settings.newAccountTimeoutMinutes}\n` +
        `block_everyone_mentions：${settings.blockEveryoneMentions}\n` +
        `block_role_mentions：${settings.blockRoleMentions}\n` +
        `join_burst_limit：${settings.joinBurstLimit}\n` +
        `join_burst_window_seconds：${settings.joinBurstWindowSeconds}\n` +
        `safe_mode：${settings.safeMode}\n` +
        `guest_lockdown_permissions：${lockdownResult ? `updated ${lockdownResult.updated}, skipped ${lockdownResult.skipped}${lockdownResult.warning ? `, ${lockdownResult.warning}` : ''}` : '未套用'}`,
      ephemeral: true
    });
  }
};
