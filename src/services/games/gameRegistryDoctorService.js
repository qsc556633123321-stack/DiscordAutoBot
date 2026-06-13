const { createLegacyFacade } = require('../../core/serviceFacade');
module.exports = createLegacyFacade(require('../../systems/gameChannels'), 'GAME_REGISTRY_DOCTOR');
