const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits,
  SlashCommandBuilder
} = require('discord.js');
const { getAiLayoutSuggestions } = require('../../systems/aiLayoutPlanner');
const {
  buildLayoutRepairEmbed,
  buildLayoutRepairPlan,
  saveLayoutRepairPlan
} = require('../../systems/layoutDecisionEngine');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ai-layout-repair')
    .setDescription('用規則引擎與 AI 輔助產生可執行的 layout 修復方案')
    .addStringOption((option) =>
      option
        .setName('mode')
        .setDescription('preview 只預覽，execute 需確認')
        .setRequired(true)
        .addChoices(
          { name: 'preview', value: 'preview' },
          { name: 'execute', value: 'execute' }
        ))
    .addStringOption((option) =>
      option
        .setName('scope')
        .setDescription('修復範圍')
        .setRequired(true)
        .addChoices(
          { name: 'all', value: 'all' },
          { name: 'permissions', value: 'permissions' },
          { name: 'duplicates', value: 'duplicates' },
          { name: 'archives', value: 'archives' },
          { name: 'onboarding', value: 'onboarding' }
        ))
    .addStringOption((option) =>
      option
        .setName('delete_confirm_text')
        .setDescription('若要允許刪除，請輸入 DELETE CONFIRM')
        .setRequired(false))
    .addStringOption((option) =>
      option
        .setName('optimization_mode')
        .setDescription('Layout optimization 強度，預設 balanced')
        .setRequired(false)
        .addChoices(
          { name: 'conservative', value: 'conservative' },
          { name: 'balanced', value: 'balanced' },
          { name: 'aggressive', value: 'aggressive' }
        ))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageChannels)) {
      await interaction.editReply('你需要 ManageChannels 權限才能使用 AI layout repair。');
      return;
    }
    if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageChannels)) {
      await interaction.editReply('Bot 缺少 ManageChannels 權限，無法執行 layout 修復。');
      return;
    }

    const mode = interaction.options.getString('mode');
    const scope = interaction.options.getString('scope');
    const deleteConfirmText = interaction.options.getString('delete_confirm_text') || '';
    const optimizationMode = interaction.options.getString('optimization_mode') || 'balanced';
    const ai = await getAiLayoutSuggestions(interaction.guild, { scope });
    const plan = buildLayoutRepairPlan(interaction.guild, {
      mode,
      scope,
      optimizationMode,
      requestedById: interaction.user.id,
      deleteConfirmText,
      aiVotes: ai.votes,
      aiUsed: ai.used,
      aiNotes: ai.notes
    });

    if (mode === 'preview') {
      await interaction.editReply({ embeds: [buildLayoutRepairEmbed(plan, '🤖 AI Layout Repair Preview')] });
      return;
    }

    saveLayoutRepairPlan(plan);
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`ai_layout_confirm_${plan.id}`)
        .setLabel(plan.actions.some((item) => item.action === 'delete') ? '確認執行修復' : '確認執行修復')
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId(`ai_layout_cancel_${plan.id}`)
        .setLabel('取消')
        .setStyle(ButtonStyle.Secondary)
    );

    await interaction.editReply({
      embeds: [buildLayoutRepairEmbed(plan, '🤖 AI Layout Repair Confirm')],
      components: [row]
    });
  }
};
