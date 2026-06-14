const { PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');
const { getWelcomeSettings, updateWelcomeSettings } = require('../../systems/welcomeSystem');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('welcome-settings')
    .setDescription('設定新人互動歡迎系統')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addBooleanOption((option) =>
      option.setName('enabled').setDescription('是否啟用新人歡迎').setRequired(false)
    )
    .addBooleanOption((option) =>
      option.setName('dm_enabled').setDescription('是否私訊新人').setRequired(false)
    )
    .addBooleanOption((option) =>
      option.setName('auto_guest_role').setDescription('是否自動給訪客身分組').setRequired(false)
    )
    .addBooleanOption((option) =>
      option.setName('reminder_enabled').setDescription('是否啟用 10 分鐘提醒').setRequired(false)
    ),

  async execute(interaction) {
    if (!interaction.guild) {
      await interaction.reply({ content: '這個指令只能在伺服器內使用。', ephemeral: true });
      return;
    }

    if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageGuild)) {
      await interaction.reply({ content: '你需要 ManageGuild 權限才能設定新人歡迎系統。', ephemeral: true });
      return;
    }

    try {
      const updates = {};
      const enabled = interaction.options.getBoolean('enabled');
      const dmEnabled = interaction.options.getBoolean('dm_enabled');
      const autoGuestRole = interaction.options.getBoolean('auto_guest_role');
      const reminderEnabled = interaction.options.getBoolean('reminder_enabled');

      if (enabled !== null) updates.enabled = enabled;
      if (dmEnabled !== null) updates.dmEnabled = dmEnabled;
      if (autoGuestRole !== null) updates.autoGuestRole = autoGuestRole;
      if (reminderEnabled !== null) updates.reminderEnabled = reminderEnabled;

      const settings = Object.keys(updates).length
        ? updateWelcomeSettings(interaction.guild.id, updates)
        : getWelcomeSettings(interaction.guild.id);

      await interaction.reply({
        content:
          `新人歡迎設定：\n` +
          `enabled=${settings.enabled}\n` +
          `dm_enabled=${settings.dmEnabled}\n` +
          `auto_guest_role=${settings.autoGuestRole}\n` +
          `reminder_enabled=${settings.reminderEnabled}`,
        ephemeral: true
      });
    } catch (error) {
      console.error('更新新人歡迎設定失敗:', error);
      await interaction.reply({ content: `更新新人歡迎設定失敗：${error.message}`, ephemeral: true });
    }
  }
};
