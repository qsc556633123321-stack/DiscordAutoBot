const { createLegacyFacade } = require('../../core/serviceFacade');
module.exports = createLegacyFacade(require('../../systems/voiceActivitySystem'), 'VOICE_ACTIVITY');
