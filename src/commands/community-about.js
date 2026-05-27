const { SlashCommandBuilder } = require('discord.js');
const { buildAboutEmbed } = require('../systems/communityConcierge');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('community-about')
    .setDescription('了解這個社群是做什麼的'),

  async execute(interaction) {
    await interaction.reply({ embeds: [buildAboutEmbed(interaction.guild)], ephemeral: true });
  }
};
