const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits,
  SlashCommandBuilder
} = require('discord.js');
const { communityArchitect } = require('../../adapters/legacy/legacyCommandAdapters');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('community-architect')
    .setDescription('像社群架構師一樣診斷 Discord 結構並提出可執行修復方案')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addStringOption((option) =>
      option
        .setName('mode')
        .setDescription('diagnose 只分析；preview 產生計畫；execute 二次確認後執行最近計畫')
        .setRequired(false)
        .addChoices(
          { name: 'diagnose', value: 'diagnose' },
          { name: 'preview', value: 'preview' },
          { name: 'execute', value: 'execute' }
        )
    )
    .addStringOption((option) =>
      option
        .setName('scope')
        .setDescription('整理範圍')
        .setRequired(false)
        .addChoices(
          { name: 'all', value: 'all' },
          { name: 'games', value: 'games' },
          { name: 'social', value: 'social' },
          { name: 'interests', value: 'interests' },
          { name: 'permissions', value: 'permissions' },
          { name: 'duplicates', value: 'duplicates' }
        )
    )
    .addStringOption((option) =>
      option
        .setName('strategy')
        .setDescription('整理策略')
        .setRequired(false)
        .addChoices(
          { name: 'conservative', value: 'conservative' },
          { name: 'balanced', value: 'balanced' },
          { name: 'aggressive', value: 'aggressive' }
        )
    ),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageChannels)) {
      await interaction.editReply('你需要 ManageChannels 權限才能使用 Community Architect。');
      return;
    }

    const mode = interaction.options.getString('mode') || 'diagnose';
    const scope = interaction.options.getString('scope') || 'all';
    const strategy = interaction.options.getString('strategy') || 'balanced';

    if (mode === 'diagnose') {
      const result = await communityArchitect.buildArchitectPlan(interaction.guild, {
        scope,
        strategy,
        createdBy: interaction.user.id
      });
      if (!result.ok) return interaction.editReply(`Community Architect failed: ${result.error.message}`);
      const plan = result.data;
      await interaction.editReply({ embeds: [communityArchitect.architectBuildDiagnoseEmbed(plan)] });
      return;
    }

    if (mode === 'preview') {
      const result = await communityArchitect.buildArchitectPlan(interaction.guild, {
        scope,
        strategy,
        createdBy: interaction.user.id
      });
      if (!result.ok) return interaction.editReply(`Community Architect failed: ${result.error.message}`);
      const plan = result.data;
      communityArchitect.saveArchitectPlan(plan);
      await interaction.editReply({ embeds: [communityArchitect.architectBuildPreviewEmbed(plan)] });
      return;
    }

    let plan = communityArchitect.getArchitectPlan(interaction.guild.id);
    if (!plan || plan.scope !== scope || plan.strategy !== strategy) {
      const result = await communityArchitect.buildArchitectPlan(interaction.guild, {
        scope,
        strategy,
        createdBy: interaction.user.id
      });
      if (!result.ok) return interaction.editReply(`Community Architect failed: ${result.error.message}`);
      plan = result.data;
      communityArchitect.saveArchitectPlan(plan);
    }

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`community_architect_confirm_${plan.planId}`)
        .setLabel('確認執行架構修復')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId(`community_architect_cancel_${plan.planId}`)
        .setLabel('取消')
        .setStyle(ButtonStyle.Secondary)
    );

    await interaction.editReply({
      embeds: [communityArchitect.architectBuildPreviewEmbed(plan)],
      components: [row]
    });
  }
};
