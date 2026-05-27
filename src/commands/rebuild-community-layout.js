const { PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');
const { buildSummaryEmbed, rebuildCommunityLayout } = require('../systems/communityBootstrapSystem');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rebuild-community-layout')
    .setDescription('重整分類與頻道排序，使用穩定 key 避免重複建立')
    .addStringOption((option) =>
      option
        .setName('mode')
        .setDescription('preview 只預覽，execute 才執行')
        .setRequired(false)
        .addChoices(
          { name: 'preview', value: 'preview' },
          { name: 'execute', value: 'execute' }
        ))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageChannels)) {
      await interaction.editReply('你需要 ManageChannels 權限才能重整 layout。');
      return;
    }
    if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageChannels)) {
      await interaction.editReply('Bot 缺少 ManageChannels 權限，無法重整頻道。');
      return;
    }

    const mode = interaction.options.getString('mode') || 'preview';
    const summary = await rebuildCommunityLayout(interaction.guild, { mode, order: true });
    await interaction.editReply({ embeds: [buildSummaryEmbed('🧭 Rebuild Community Layout', summary)] });
  }
};
