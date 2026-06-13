const { fromThrowable, ok } = require('../../core/result');
const legacy = require('../../systems/gameChannels');
const suggestions = require('../../systems/gameSuggestionSystem');
const policy = require('../../domain/games/gameCategoryPolicy');

async function invoke(method, ...args) {
  try {
    return ok(await legacy[method](...args));
  } catch (error) {
    return fromThrowable(error, 'GAME_CATEGORY_FAILED');
  }
}

async function archiveInactive(guild) {
  try {
    return ok(await suggestions.archiveInactiveGames(guild));
  } catch (error) {
    return fromThrowable(error, 'GAME_ARCHIVE_FAILED');
  }
}

async function suggest(interaction, gameName, reason, requestedContent = '') {
  try {
    return ok(await suggestions.createGameSuggestion(interaction, gameName, reason, requestedContent));
  } catch (error) {
    return fromThrowable(error, 'GAME_SUGGESTION_FAILED');
  }
}

module.exports = {
  archiveInactive,
  buildDoctorPlan: (...args) => invoke('buildGameRegistryDoctorPlan', ...args),
  fix: (...args) => invoke('fixGameCategory', ...args),
  policy,
  setup: (...args) => invoke('setupGameChannels', ...args),
  suggest
};
