const { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');
const { getTempVoiceSettings, updateTempVoiceSettings } = require('../systems/tempVoice');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('tempvoice-settings')
    .setDescription('設定 Temp Voice 2.0 自動語音房功能')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addBooleanOption((option) =>
      option
        .setName('auto_transfer')
        .setDescription('房主離開後是否自動轉移房主')
        .setRequired(false)
    )
    .addIntegerOption((option) =>
      option
        .setName('auto_delete_seconds')
        .setDescription('空房後幾秒自動刪除，預設 30')
        .setMinValue(5)
        .setMaxValue(600)
        .setRequired(false)
    )
    .addBooleanOption((option) =>
      option
        .setName('create_control_panel')
        .setDescription('建立語音房後是否發送控制台')
        .setRequired(false)
    )
    .addBooleanOption((option) =>
      option
        .setName('create_activity_message')
        .setDescription('建立語音房後是否發送活動提示')
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName('cleanup_mode')
        .setDescription('語音房結束後如何處理控制面板')
        .setRequired(false)
        .addChoices(
          { name: 'disable_panel', value: 'disable_panel' },
          { name: 'delete_panel', value: 'delete_panel' },
          { name: 'keep_panel', value: 'keep_panel' }
        )
    ),

  async execute(interaction) {
    if (!interaction.guild) {
      await interaction.reply({ content: '這個指令只能在伺服器內使用。', ephemeral: true });
      return;
    }

    if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageChannels)) {
      await interaction.reply({ content: '你需要 ManageChannels 權限才能調整 Temp Voice 設定。', ephemeral: true });
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
