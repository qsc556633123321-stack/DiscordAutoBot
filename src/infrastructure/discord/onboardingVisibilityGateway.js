// fallbackAllowed: controlled legacy compatibility gateway
// The legacy implementation remains the source
// of behavior until a later migration replaces the underlying inspection logic.
const legacyBootstrap = require('../../legacy/community/communityBootstrapSystem');

function inspect(guild) {
  return legacyBootstrap.checkOnboardingVisibility(guild);
}

function buildEmbed(report) {
  return legacyBootstrap.buildOnboardingCheckEmbed(report);
}

module.exports = { buildEmbed, inspect };
