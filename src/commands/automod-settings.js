const { PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');
const {
  addBlacklistLink,
  addWhitelistRole,
  getAutoModSettings,
  updateAutoModSettings
} = require('../systems/autoMod');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('automod-settings')
    .setDescription('設定 AutoMod 社群防護系統')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addBooleanOption((option) =>
      option.setName('spam_enabled').setDescription('是否啟用防洗版').setRequired(false)
    )
    .addBooleanOption((option) =>
      option.setName('invite_enabled').setDescription('是否阻擋 Discord invite 廣告').setRequired(false)
    )
    .addBooleanOption((option) =>
      option.setName('link_enabled').setDescription('是否阻擋可疑連結').setRequired(false)
    )
    .addBooleanOption((option) =>
      option.setName('mention_enabled').setDescription('是否阻擋大量 mention').setRequired(false)
    )
    .addIntegerOption((option) =>
      option
        .setName('timeout_duration')
        .setDescription('Timeout 分鐘數，預設 5')
        .setRequired(false)
        .setMinValue(1)
        .setMaxValue(1440)
    )
    .addRoleOption((option) =>
      option.setName('whitelist_role').setDescription('加入白名單身分組').setRequired(false)
    )
    .addStringOption((option) =>
      option.setName('blacklist_add').setDescription('新增可疑連結黑名單，例如 example.com').setRequired(false)
    ),

  async execute(interaction) {
    if (!interaction.guild) {
      await interaction.reply({ content: '這個指令只能在伺服器內使用。', ephemeral: true });
      return;
    }

    if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageGuild)) {
      await interaction.reply({ content: '你需要 ManageGuild 權限才能設定 AutoMod。', ephemeral: true });
      return;
    }

    try {
      const updates = {};
      const optionMap = [
        ['spam_enabled', 'spamEnabled'],
        ['invite_enabled', 'inviteEnabled'],
        ['link_enabled', 'linkEnabled'],
        ['mention_enabled', 'mentionEnabled']
      ];

      for (const [optionName, settingName] of optionMap) {
        const value = interaction.options.getBoolean(optionName);
        if (value !== null) updates[settingName] = value;
      }

      const timeoutDuration = interaction.options.getInteger('timeout_duration');
      if (timeoutDuration) updates.timeoutDurationMinutes = timeoutDuration;

      let settings = Object.keys(updates).length
        ? updateAutoModSettings(interaction.guild.id, updates)
        : getAutoModSettings(interaction.guild.id);

      const whitelistRole = interaction.options.getRole('whitelist_role');
      if (whitelistRole) settings = addWhitelistRole(interaction.guild.id, whitelistRole.id);

      const blacklistAdd = interaction.options.getString('blacklist_add');
      if (blacklistAdd) settings = addBlacklistLink(interaction.guild.id, blacklistAdd);

      await interaction.reply({
        content:
          `AutoMod 設定已更新。\n` +
          `spam=${settings.spamEnabled}, invite=${settings.inviteEnabled}, link=${settings.linkEnabled}, mention=${settings.mentionEnabled}\n` +
          `timeout=${settings.timeoutDurationMinutes} 分鐘\n` +
          `白名單身分組：${settings.whitelistedRoleIds.length}\n` +
          `黑名單連結：${settings.blacklistedLinks.join(', ')}`,
        ephemeral: true
      });
    } catch (error) {
      console.error('更新 AutoMod 設定失敗:', error);
      await interaction.reply({ content: `更新 AutoMod 設定失敗：${error.message}`, ephemeral: true });
    }
  }
};
