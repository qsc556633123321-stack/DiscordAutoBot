const { SlashCommandBuilder } = require('discord.js');
const { buildRoadmapEmbed } = require('../systems/communityConcierge');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('community-roadmap')
    .setDescription('查看社群未來規劃與開發方向'),

  async execute(interaction) {
    await interaction.reply({ embeds: [buildRoadmapEmbed()], ephemeral: true });
  }
};
