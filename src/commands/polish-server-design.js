const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits,
  SlashCommandBuilder
} = require('discord.js');
const { buildPolishEmbed, buildPolishPlan, savePolishPlan } = require('../systems/serverPolisher');
const { safeDeferReply, safeEditReply } = require('../utils/interactionReplies');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('polish-server-design')
    .setDescription('預覽或執行社群整體視覺與結構完善')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addStringOption((option) =>
      option
        .setName('mode')
        .setDescription('preview 只預覽，execute 需二次確認')
        .setRequired(true)
        .addChoices(
          { name: 'preview', value: 'preview' },
          { name: 'execute', value: 'execute' }
        )
    )
    .addStringOption((option) =>
      option
        .setName('theme')
        .setDescription('視覺主題')
        .setRequired(true)
        .addChoices(
          { name: 'gaming_cozy', value: 'gaming_cozy' },
          { name: 'cyber_base', value: 'cyber_base' },
          { name: 'anime_community', value: 'anime_community' }
        )
    )
    .addBooleanOption((option) =>
      option
        .setName('rename_channels')
        .setDescription('是否統一頻道名稱')
        .setRequired(true)
    )
    .addBooleanOption((option) =>
      option
        .setName('polish_roles')
        .setDescription('是否整理身分組名稱、顏色、排序與 hoist')
        .setRequired(true)
    )
    .addBooleanOption((option) =>
      option
        .setName('setup_native_features')
        .setDescription('是否嘗試整合 Discord 原生 Community 設定')
        .setRequired(true)
    ),

  async execute(interaction) {
    await safeDeferReply(interaction, { ephemeral: true });

    try {
      if (!interaction.guild) {
        await safeEditReply(interaction, '這個指令只能在伺服器內使用。');
        return;
      }
      if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageGuild)) {
        await safeEditReply(interaction, '你需要 ManageGuild 權限才能使用此指令。');
        return;
      }
      if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageChannels)) {
        await safeEditReply(interaction, 'Bot 需要 ManageChannels 權限才能整理伺服器結構。');
        return;
      }

      const mode = interaction.options.getString('mode', true);
      const plan = buildPolishPlan(interaction.guild, {
        mode,
        theme: interaction.options.getString('theme', true),
        renameChannels: interaction.options.getBoolean('rename_channels', true),
        polishRoles: interaction.options.getBoolean('polish_roles', true),
        setupNativeFeatures: interaction.options.getBoolean('setup_native_features', true),
        requestedById: interaction.user.id,
        sourceChannelId: interaction.channelId
      });
      const embed = buildPolishEmbed(plan);

      if (mode === 'preview') {
        await safeEditReply(interaction, { embeds: [embed], components: [] });
        return;
      }

      const planId = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      savePolishPlan(planId, plan);
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`polish_confirm_${planId}`)
          .setLabel('確認執行完善')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId(`polish_cancel_${planId}`)
          .setLabel('取消')
          .setStyle(ButtonStyle.Secondary)
      );

      await safeEditReply(interaction, {
        content: '按下確認後才會開始整理社群結構、頻道與身分組。',
        embeds: [embed],
        components: [row]
      });
    } catch (error) {
      console.error('polish-server-design failed:', error);
      await safeEditReply(interaction, '⚠️ 執行失敗，請查看 console logs。');
    }
  }
};
