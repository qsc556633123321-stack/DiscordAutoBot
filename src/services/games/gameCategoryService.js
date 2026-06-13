const { createLegacyFacade } = require('../../core/serviceFacade');
const policy = require('../../domain/games/gameCategoryPolicy');
module.exports = { ...createLegacyFacade(require('../../systems/gameChannels'), 'GAME_CATEGORY'), policy };
