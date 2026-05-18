const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits,
  SlashCommandBuilder
} = require('discord.js');
const {
  buildCategoryCleanupEmbed,
  createCategoryCleanupPlan,
  saveCategoryCleanupPlan
} = require('../systems/categoryCleaner');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('cleanup-empty-categories')
    .setDescription('預覽或執行空分類清理')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addStringOption((option) =>
      option
        .setName('mode')
        .setDescription('preview 只預覽；execute 需要按鈕確認')
        .setRequired(true)
        .addChoices(
          { name: 'preview', value: 'preview' },
          { name: 'execute', value: 'execute' }
        )
    ),

  async execute(interaction) {
    if (!interaction.guild) {
      await interaction.reply({ content: '這個指令只能在伺服器中使用。', ephemeral: true });
      return;
    }

    if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageChannels)) {
      await interaction.reply({ content: '你需要 ManageChannels 權限才能清理空分類。', ephemeral: true });
      return;
    }

    const mode = interaction.options.getString('mode');
    const plan = createCategoryCleanupPlan(interaction.guild, {
      mode,
      deleteLevel: 'safe',
      requestedById: interaction.user.id
    });
    saveCategoryCleanupPlan(interaction.id, plan);

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`cleanup_confirm_${interaction.id}`)
        .setLabel('確認清理空分類')
        .setStyle(ButtonStyle.Danger)
        .setDisabled(mode !== 'execute'),
      new ButtonBuilder()
        .setCustomId(`cleanup_cancel_${interaction.id}`)
        .setLabel('取消')
        .setStyle(ButtonStyle.Secondary)
    );

    await interaction.reply({
      embeds: [buildCategoryCleanupEmbed(plan)],
      components: [row],
      ephemeral: true
    });
  }
};
