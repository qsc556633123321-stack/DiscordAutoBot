const { SlashCommandBuilder } = require('discord.js');
const { createCommunityRoadmapFeature } = require('../../composition/communityRoadmapFeature');
const { createCommunityRoadmapEmbed } = require('../../modules/community/communityRoadmapEmbed');

const data = new SlashCommandBuilder()
  .setName('community-roadmap')
  .setDescription('查看社群未來規劃與開發方向');

function createCommunityRoadmapCommand({ useCase = createCommunityRoadmapFeature().getCommunityRoadmap } = {}) {
  return {
    data,
    async execute(interaction) {
      const result = useCase.execute();
      if (!result.ok) throw new Error(result.error.message);
      await interaction.reply({
        embeds: [createCommunityRoadmapEmbed(result.data.roadmap)],
        ephemeral: true
      });
    }
  };
}

const command = createCommunityRoadmapCommand();

module.exports = { ...command, createCommunityRoadmapCommand };
