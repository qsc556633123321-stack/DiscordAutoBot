const { EmbedBuilder } = require('discord.js');

function createCommunityRoadmapEmbed(roadmap) {
  return new EmbedBuilder()
    .setColor(0xf2c94c)
    .setTitle('🚧 社群開發日誌')
    .setDescription('這不是一張冷冰冰的待辦清單，而是我們一起把社群慢慢做成家的方向。')
    .addFields(roadmap.sections.map((section) => ({
      name: section.label,
      value: section.items.map((item) => `- ${item}`).join('\n') || '整理中',
      inline: false
    })))
    .setFooter({ text: '如果你有想法，可以直接丟到建議區或開 Ticket。' })
    .setTimestamp();
}

module.exports = { createCommunityRoadmapEmbed };
