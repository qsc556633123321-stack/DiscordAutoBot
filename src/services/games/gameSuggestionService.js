const { createLegacyFacade } = require('../../core/serviceFacade');
module.exports = createLegacyFacade(require('../../systems/gameSuggestionSystem'), 'GAME_SUGGESTION');
