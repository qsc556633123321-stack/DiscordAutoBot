const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits,
  SlashCommandBuilder
} = require('discord.js');
const {
  buildFactoryResetEmbed,
  buildFactoryResetPlan,
  saveFactoryResetPlan
} = require('../../systems/factoryReset');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('factory-reset-server')
    .setDescription('高風險：清理 Bot 產生的結構並重建新版模板')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addStringOption((option) =>
      option
        .setName('mode')
        .setDescription('preview 只顯示計畫，execute 需要二次確認')
        .setRequired(true)
        .addChoices(
          { name: 'preview', value: 'preview' },
          { name: 'execute', value: 'execute' }
        )
    )
    .addStringOption((option) =>
      option
        .setName('rebuild_template')
        .setDescription('重建後要套用的新版模板')
        .setRequired(true)
        .addChoices(
          { name: 'mixed_community', value: 'mixed_community' },
          { name: 'gaming_community', value: 'gaming_community' },
          { name: 'creator_community', value: 'creator_community' }
        )
    )
    .addBooleanOption((option) =>
      option
        .setName('keep_admin')
        .setDescription('是否保留管理員後台與管理頻道，預設 true')
        .setRequired(false)
    )
    .addBooleanOption((option) =>
      option
        .setName('keep_logs')
        .setDescription('是否保留 server-logs / ticket-logs，預設 true')
        .setRequired(false)
    )
    .addBooleanOption((option) =>
      option
        .setName('remove_roles')
        .setDescription('是否刪除 Bot 建立的自助身分組，預設 false')
        .setRequired(false)
    ),

  async execute(interaction) {
    if (!interaction.guild) {
      await interaction.reply({ content: '這個指令只能在伺服器內使用。', ephemeral: true });
      return;
    }

    if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageChannels)) {
      await interaction.reply({ content: '你需要 ManageChannels 權限才能使用工廠重置。', ephemeral: true });
      return;
    }

    const botMember = interaction.guild.members.me;
    if (!botMember.permissions.has(PermissionFlagsBits.ManageChannels)) {
      await interaction.reply({ content: 'Bot 缺少 ManageChannels 權限，無法安全執行工廠重置。', ephemeral: true });
      return;
    }

    const mode = interaction.options.getString('mode');
    const rebuildTemplate = interaction.options.getString('rebuild_template');
    const keepAdmin = interaction.options.getBoolean('keep_admin') ?? true;
    const keepLogs = interaction.options.getBoolean('keep_logs') ?? true;
    const removeRoles = interaction.options.getBoolean('remove_roles') ?? false;

    const plan = buildFactoryResetPlan(interaction.guild, {
      mode,
      rebuildTemplate,
      keepAdmin,
      keepLogs,
      removeRoles,
      requestedById: interaction.user.id,
      sourceChannelId: interaction.channelId
    });
    saveFactoryResetPlan(interaction.id, plan);

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`factory_reset_confirm_${interaction.id}`)
        .setLabel('確認工廠重置')
        .setStyle(ButtonStyle.Danger)
        .setDisabled(mode !== 'execute'),
      new ButtonBuilder()
        .setCustomId(`factory_reset_cancel_${interaction.id}`)
        .setLabel('取消')
        .setStyle(ButtonStyle.Secondary)
    );

    await interaction.reply({
      embeds: [buildFactoryResetEmbed(plan)],
      components: [row],
      ephemeral: true
    });
  }
};
