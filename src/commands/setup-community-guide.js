const { PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');
const { setupCommunityGuide, setupRoadmapPanel } = require('../systems/communityConcierge');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup-community-guide')
    .setDescription('建立互動式社群導覽面板')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageChannels)) {
      await interaction.editReply('你需要 ManageChannels 權限才能建立社群導覽。');
      return;
    }
    const guide = await setupCommunityGuide(interaction.guild, { mode: 'create' });
    const roadmap = await setupRoadmapPanel(interaction.guild);
    await interaction.editReply(`已建立/更新導覽面板：${guide.channel}\n已建立/更新 Roadmap：${roadmap.channel}`);
  }
};
