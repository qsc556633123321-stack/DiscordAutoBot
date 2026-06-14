const { PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');
const { setupCommunityGuide, setupRoadmapPanel } = require('../../systems/communityConcierge');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('refresh-community-guide')
    .setDescription('刷新既有互動式社群導覽與 Roadmap 面板')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageChannels)) {
      await interaction.editReply('你需要 ManageChannels 權限才能刷新社群導覽。');
      return;
    }
    const guide = await setupCommunityGuide(interaction.guild, { mode: 'refresh' });
    const roadmap = await setupRoadmapPanel(interaction.guild);
    await interaction.editReply(`已刷新導覽面板：${guide.channel}\n已刷新 Roadmap：${roadmap.channel}`);
  }
};
