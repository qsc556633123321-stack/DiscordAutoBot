const { createLegacyFacade } = require('../../core/serviceFacade');
module.exports = createLegacyFacade(require('../../systems/channelPanels'), 'CHANNEL_PANEL');
