const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits,
  SlashCommandBuilder
} = require('discord.js');
const { rebuild } = require('../../adapters/legacy/legacyCommandAdapters');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rebuild-community-v3')
    .setDescription('預覽或重建 Community Architecture V3')
    .addStringOption((option) => option
      .setName('mode')
      .setDescription('preview 只預覽；execute 需按鈕二次確認')
      .setRequired(true)
      .addChoices(
        { name: 'preview', value: 'preview' },
        { name: 'execute', value: 'execute' }
      ))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageGuild) ||
        !interaction.memberPermissions.has(PermissionFlagsBits.ManageChannels)) {
      await interaction.editReply('你需要 ManageGuild 與 ManageChannels 權限才能重建 V3。');
      return;
    }
    if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageChannels) ||
        !interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageRoles)) {
      await interaction.editReply('Bot 需要 ManageChannels 與 ManageRoles 權限才能重建 V3。');
      return;
    }

    const mode = interaction.options.getString('mode');
    const result = rebuild.previewV3(interaction.guild, interaction.user.id);
    if (!result.ok) {
      await interaction.editReply(`V3 preview failed: ${result.error.message}`);
      return;
    }
    const { plan, embed } = result.data;
    rebuild.saveV3Plan(plan);
    if (mode === 'preview') {
      await interaction.editReply({ embeds: [embed] });
      return;
    }

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`community_v3_confirm_${plan.planId}`)
        .setLabel('確認重建 V3')
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId(`community_v3_cancel_${plan.planId}`)
        .setLabel('取消')
        .setStyle(ButtonStyle.Secondary)
    );
    await interaction.editReply({ embeds: [embed], components: [row] });
  }
};
