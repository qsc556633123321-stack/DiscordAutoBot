const { PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');
const { createCheckOnboardingVisibilityUseCase } = require('../../application/community/checkOnboardingVisibilityUseCase');

const NO_PERMISSION_MESSAGE = '你需要 ManageChannels 權限才能檢查 onboarding visibility。';

const data = new SlashCommandBuilder()
  .setName('check-onboarding-visibility')
  .setDescription('檢查 Discord Onboarding 入口頻道是否對 @everyone 可見')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels);

function createCheckOnboardingVisibilityCommand({ useCase = createCheckOnboardingVisibilityUseCase() } = {}) {
  return {
    data,
    async execute(interaction) {
      await interaction.deferReply({ ephemeral: true });
      const result = await useCase.execute({
        guild: interaction.guild,
        hasManageChannels: interaction.memberPermissions.has(PermissionFlagsBits.ManageChannels)
      });
      if (!result.ok && result.error?.code === 'ONBOARDING_VISIBILITY_PERMISSION_DENIED') {
        await interaction.editReply(NO_PERMISSION_MESSAGE);
        return;
      }
      await interaction.editReply(result.ok
        ? { embeds: [useCase.buildEmbed(result.data)] }
        : result.error.message);
    }
  };
}

const command = createCheckOnboardingVisibilityCommand();

module.exports = { ...command, createCheckOnboardingVisibilityCommand };
