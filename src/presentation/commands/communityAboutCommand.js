const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const { createCommunityAboutFeature } = require('../../composition/communityAboutFeature');

const data = new SlashCommandBuilder()
  .setName('community-about')
  .setDescription('了解這個社群是做什麼的');

function createCommunityAboutCommand({ useCase = createCommunityAboutFeature().getCommunityAbout } = {}) {
  return {
    data,
    async execute(interaction) {
      const result = useCase.execute({ guildName: interaction.guild.name });
      if (!result.ok) throw new Error(result.error.message);
      await interaction.reply({
        embeds: [new EmbedBuilder(result.data.about.embed)],
        ephemeral: true
      });
    }
  };
}

const command = createCommunityAboutCommand();

module.exports = { ...command, createCommunityAboutCommand };
