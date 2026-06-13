const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  PermissionFlagsBits,
  SlashCommandBuilder
} = require('discord.js');
const gameCategoryService = require('../services/games/gameCategoryService');

function list(items, mapper, empty = '無') {
  const lines = items.map(mapper).filter(Boolean);
  return lines.length ? lines.slice(0, 15).join('\n').slice(0, 1024) : empty;
}

function buildEmbed(plan) {
  const metadata = plan.actions.filter((item) => item.type === 'repair_metadata');
  const renamed = plan.actions.filter((item) => item.type === 'rename_child');
  const entries = plan.actions.filter((item) => item.type === 'repair_create_entry');
  const duplicates = plan.actions.filter((item) => item.type === 'archive_duplicate_category');

  return new EmbedBuilder()
    .setColor(duplicates.length ? 0xf2c94c : 0x57f287)
    .setTitle('🎮 Game Registry Doctor')
    .setDescription([
      'Community Schema v2：Game Registry + Semantic Identity Engine',
      'preview 不會修改伺服器；execute 需要按確認後才修復。',
      `問題數：${plan.actions.length}`
    ].join('\n'))
    .addFields(
      { name: '缺 metadata', value: list(metadata, (item) => `${item.categoryName} -> ${item.gameId}`), inline: false },
      { name: '子頻道命名不一致', value: list(renamed, (item) => `${item.channelName} -> ${item.newName}`), inline: false },
      { name: 'create entry 未註冊', value: list(entries, (item) => `${item.channelName} (${item.displayName})`), inline: false },
      { name: '重複遊戲分類', value: list(duplicates, (item) => `${item.categoryName}，保留 ${item.keepCategoryName}`), inline: false }
    )
    .setTimestamp();
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('game-registry-doctor')
    .setDescription('檢查並修復 Community Schema v2 遊戲語意身份與 metadata')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addStringOption((option) =>
      option
        .setName('mode')
        .setDescription('preview 只檢查；execute 需二次確認後修復')
        .setRequired(true)
        .addChoices(
          { name: 'preview', value: 'preview' },
          { name: 'execute', value: 'execute' }
        )
    ),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageChannels)) {
      await interaction.editReply('你需要 ManageChannels 權限才能使用 Game Registry Doctor。');
      return;
    }

    const mode = interaction.options.getString('mode');
    const result = await gameCategoryService.buildDoctorPlan(interaction.guild, interaction.user.id);
    if (!result.ok) return interaction.editReply(result.error.message);
    const plan = result.data;
    const embed = buildEmbed(plan);

    if (mode === 'preview' || !plan.actions.length) {
      await interaction.editReply({ embeds: [embed] });
      return;
    }

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`game_registry_doctor_confirm_${plan.id}`)
        .setLabel('確認修復')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId(`game_registry_doctor_cancel_${plan.id}`)
        .setLabel('取消')
        .setStyle(ButtonStyle.Secondary)
    );

    await interaction.editReply({ embeds: [embed], components: [row] });
  },

  buildEmbed
};
