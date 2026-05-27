const { PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');
const { buildOnboardingCheckEmbed, checkOnboardingVisibility } = require('../systems/communityBootstrapSystem');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('check-onboarding-visibility')
    .setDescription('檢查 Discord Onboarding 是否能看到公開入口頻道')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageChannels)) {
      await interaction.editReply('你需要 ManageChannels 權限才能檢查 onboarding visibility。');
      return;
    }
    const results = checkOnboardingVisibility(interaction.guild);
    await interaction.editReply({ embeds: [buildOnboardingCheckEmbed(results)] });
  }
};
