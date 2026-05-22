const { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');
const { getTempVoiceSettings, updateTempVoiceSettings } = require('../systems/tempVoice');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('tempvoice-settings')
    .setDescription('設定 Temp Voice 2.0 臨時語音系統')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addBooleanOption((option) =>
      option
        .setName('auto_transfer')
        .setDescription('房主離開後自動轉移給房內成員')
        .setRequired(false)
    )
    .addIntegerOption((option) =>
      option
        .setName('auto_delete_seconds')
        .setDescription('空房幾秒後自動刪除，預設 30')
        .setMinValue(5)
        .setMaxValue(600)
        .setRequired(false)
    )
    .addBooleanOption((option) =>
      option
        .setName('create_control_panel')
        .setDescription('建立語音房後提供私有控制台')
        .setRequired(false)
    )
    .addBooleanOption((option) =>
      option
        .setName('create_activity_message')
        .setDescription('建立語音房後發送公開活動通知')
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName('cleanup_mode')
        .setDescription('語音房結束後如何處理控制台')
        .setRequired(false)
        .addChoices(
          { name: 'disable_panel（推薦，按鈕失效）', value: 'disable_panel' },
          { name: 'delete_panel（刪除控制台）', value: 'delete_panel' },
          { name: 'keep_panel（保留不處理）', value: 'keep_panel' }
        )
    ),

  async execute(interaction) {
    if (!interaction.guild) {
      await interaction.reply({ content: '這個指令只能在伺服器內使用。', ephemeral: true });
      return;
    }

    if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageChannels)) {
      await interaction.reply({ content: '你需要 ManageChannels 權限才能設定 Temp Voice。', ephemeral: true });
      return;
    }

    const patch = {};
    const autoTransfer = interaction.options.getBoolean('auto_transfer');
    const autoDeleteSeconds = interaction.options.getInteger('auto_delete_seconds');
    const createControlPanel = interaction.options.getBoolean('create_control_panel');
    const createActivityMessage = interaction.options.getBoolean('create_activity_message');
    const cleanupMode = interaction.options.getString('cleanup_mode');

    if (autoTransfer !== null) patch.autoTransfer = autoTransfer;
    if (autoDeleteSeconds !== null) patch.autoDeleteSeconds = autoDeleteSeconds;
    if (createControlPanel !== null) patch.createControlPanel = createControlPanel;
    if (createActivityMessage !== null) patch.createActivityMessage = createActivityMessage;
    if (cleanupMode !== null) patch.cleanupMode = cleanupMode;

    const settings = Object.keys(patch).length
      ? updateTempVoiceSettings(interaction.guild.id, patch)
      : getTempVoiceSettings(interaction.guild.id);

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle('Temp Voice 2.0 設定')
      .addFields(
        { name: 'auto_transfer', value: String(settings.autoTransfer), inline: true },
        { name: 'auto_delete_seconds', value: String(settings.autoDeleteSeconds), inline: true },
        { name: 'create_control_panel', value: String(settings.createControlPanel), inline: true },
        { name: 'create_activity_message', value: String(settings.createActivityMessage), inline: true },
        { name: 'cleanup_mode', value: String(settings.cleanupMode), inline: true }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
