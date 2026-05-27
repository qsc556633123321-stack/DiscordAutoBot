const { PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');
const { buildLayoutDoctorEmbed, layoutDoctor } = require('../systems/communityBootstrapSystem');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('layout-doctor')
    .setDescription('掃描社群 layout：重複、缺少、錯位、metadata、onboarding 可見性')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageChannels)) {
      await interaction.editReply('你需要 ManageChannels 權限才能檢查 layout。');
      return;
    }

    const report = layoutDoctor(interaction.guild);
    await interaction.editReply({ embeds: [buildLayoutDoctorEmbed(report)] });
  }
};
