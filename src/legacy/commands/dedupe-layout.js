const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits,
  SlashCommandBuilder
} = require('discord.js');
const {
  buildDedupeEmbed,
  buildDedupePlan,
  saveDedupePlan
} = require('../../systems/communityBootstrapSystem');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('dedupe-layout')
    .setDescription('偵測重複分類與頻道，必要時移到舊頻道封存，不會刪除')
    .addStringOption((option) =>
      option
        .setName('mode')
        .setDescription('preview 只預覽，execute 需按鈕確認')
        .setRequired(true)
        .addChoices(
          { name: 'preview', value: 'preview' },
          { name: 'execute', value: 'execute' }
        ))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageChannels)) {
      await interaction.editReply('你需要 ManageChannels 權限才能整理重複 layout。');
      return;
    }
    if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageChannels)) {
      await interaction.editReply('Bot 缺少 ManageChannels 權限，無法移動重複頻道。');
      return;
    }

    const mode = interaction.options.getString('mode');
    const plan = buildDedupePlan(interaction.guild, {
      mode,
      requestedById: interaction.user.id
    });

    if (mode === 'preview') {
      await interaction.editReply({ embeds: [buildDedupeEmbed(plan)] });
      return;
    }

    saveDedupePlan(plan.id, plan);
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`dedupe_confirm_${plan.id}`)
        .setLabel('確認封存重複項目')
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId(`dedupe_cancel_${plan.id}`)
        .setLabel('取消')
        .setStyle(ButtonStyle.Secondary)
    );

    await interaction.editReply({
      embeds: [buildDedupeEmbed(plan)],
      components: [row]
    });
  }
};
