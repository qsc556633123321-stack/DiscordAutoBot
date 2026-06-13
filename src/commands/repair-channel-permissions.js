const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits,
  SlashCommandBuilder
} = require('discord.js');
const {
  buildLayoutRepairEmbed,
  saveLayoutRepairPlan
} = require('../systems/layoutDecisionEngine');
const { permissions } = require('../adapters/legacy/legacyCommandAdapters');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('repair-channel-permissions')
    .setDescription('依 visibilityType 修復分類與頻道權限')
    .addStringOption((option) =>
      option
        .setName('mode')
        .setDescription('preview 只預覽，execute 需確認')
        .setRequired(false)
        .addChoices(
          { name: 'preview', value: 'preview' },
          { name: 'execute', value: 'execute' }
        ))
    .addStringOption((option) =>
      option
        .setName('scope')
        .setDescription('要修復的權限範圍')
        .setRequired(false)
        .addChoices(
          { name: 'all', value: 'all' },
          { name: 'onboarding', value: 'onboarding' },
          { name: 'restricted', value: 'restricted' },
          { name: 'admin', value: 'admin' },
          { name: 'games', value: 'games' },
          { name: 'guest_gate', value: 'guest_gate' }
        ))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageChannels)) {
      await interaction.editReply('你需要 ManageChannels 權限才能修復頻道權限。');
      return;
    }
    if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageChannels)) {
      await interaction.editReply('Bot 缺少 ManageChannels 權限，無法修復頻道權限。');
      return;
    }

    const mode = interaction.options.getString('mode') || 'preview';
    const scope = interaction.options.getString('scope') || 'all';
    const result = permissions.buildRepairPlan(interaction.guild, {
      mode,
      scope,
      requestedById: interaction.user.id
    });
    if (!result.ok) {
      await interaction.editReply(`Permission preview failed: ${result.error.message}`);
      return;
    }
    const plan = result.data;

    if (mode === 'preview') {
      await interaction.editReply({ embeds: [buildLayoutRepairEmbed(plan, '🔧 Permission Repair Preview')] });
      return;
    }

    saveLayoutRepairPlan(plan);
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`permrepair_confirm_${plan.id}`)
        .setLabel('確認修復權限')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId(`permrepair_cancel_${plan.id}`)
        .setLabel('取消')
        .setStyle(ButtonStyle.Secondary)
    );

    await interaction.editReply({
      embeds: [buildLayoutRepairEmbed(plan, '🔧 Permission Repair Confirm')],
      components: [row]
    });
  }
};
