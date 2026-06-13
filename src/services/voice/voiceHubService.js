const { createLegacyFacade } = require('../../core/serviceFacade');
module.exports = createLegacyFacade(require('../../systems/voiceHub'), 'VOICE_HUB');
