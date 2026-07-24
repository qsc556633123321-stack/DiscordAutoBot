const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

const BUTTON_STYLES = Object.freeze({
  primary: ButtonStyle.Primary,
  secondary: ButtonStyle.Secondary,
  success: ButtonStyle.Success,
  danger: ButtonStyle.Danger
});

function renderCommunityGuide({ guide, actions } = {}) {
  const description = [
    guide.intro,
    '',
    ...guide.sections.flatMap((section) => [section.title, ...section.items])
  ].filter((line, index, all) => line || (index > 0 && index < all.length - 1)).join('\n');
  const embed = new EmbedBuilder()
    .setColor(guide.color)
    .setTitle(guide.title)
    .setDescription(description)
    .setFooter({ text: guide.footer })
    .setTimestamp();

  const firstRow = actions.slice(0, 3);
  const secondRow = actions.slice(3);
  const components = [firstRow, secondRow]
    .filter((row) => row.length)
    .map((row) => new ActionRowBuilder().addComponents(row.map((action) => new ButtonBuilder()
      .setCustomId(action.id)
      .setLabel(action.label)
      .setEmoji(action.emoji)
      .setStyle(BUTTON_STYLES[action.style] || ButtonStyle.Secondary)
      .setDisabled(action.disabled))));

  return { embeds: [embed], components };
}

module.exports = { renderCommunityGuide };
