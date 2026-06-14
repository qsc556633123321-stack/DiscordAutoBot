const { PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');
const { updateAnnouncementPinSettings } = require('../../systems/announcementPin');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('announcement-pin-settings')
    .setDescription('設定公告自動置頂功能')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addIntegerOption((option) =>
      option
        .setName('max_pins')
        .setDescription('保留最新幾則公告置頂，預設 3')
        .setRequired(false)
        .setMinValue(1)
        .setMaxValue(10)
    )
    .addBooleanOption((option) =>
      option
        .setName('enabled')
        .setDescription('是否啟用公告自動置頂')
        .setRequired(false)
    ),

  async execute(interaction) {
    if (!interaction.guild) {
      await interaction.reply({ content: '這個指令只能在伺服器中使用。', ephemeral: true });
      return;
    }

    if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageMessages)) {
      await interaction.reply({ content: '你需要 ManageMessages 權限才能設定公告自動置頂。', ephemeral: true });
      return;
    }

    try {
      const settings = updateAnnouncementPinSettings(interaction.guild.id, {
        enabled: interaction.options.getBoolean('enabled') ?? true,
        maxPins: interaction.options.getInteger('max_pins') || 3
      });

      await interaction.reply({
        content: `公告自動置頂設定已更新：enabled=${settings.enabled}, maxPins=${settings.maxPins}`,
        ephemeral: true
      });
    } catch (error) {
      console.error('更新公告置頂設定失敗：', error);
      await interaction.reply({ content: `更新失敗：${error.message}`, ephemeral: true });
    }
  }
};
