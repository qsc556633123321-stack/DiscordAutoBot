async function buildHelpMeStartEmbed(guild, answers) {
  const { createHelpMeStartFeature } = require('../composition/community/helpMeStartFeature');
  const { createHelpMeStartEmbed } = require('../presentation/community/helpMeStartEmbed');
  const result = await createHelpMeStartFeature({ guild }).getHelpMeStartRecommendation.execute({
    guildId: guild.id,
    guildName: guild.name,
    answers
  });
  return createHelpMeStartEmbed(result);
}

module.exports = {
  buildHelpMeStartEmbed
};
