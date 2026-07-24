const { createHelpMeStartCompatibilityAdapter } = require('../composition/community/helpMeStartFeature');

async function buildHelpMeStartEmbed(guild, answers) {
  return createHelpMeStartCompatibilityAdapter({ guild }).buildEmbed(answers);
}

module.exports = {
  buildHelpMeStartEmbed
};
