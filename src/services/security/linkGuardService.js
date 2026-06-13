const { createLegacyFacade } = require('../../core/serviceFacade');
module.exports = createLegacyFacade(require('../../systems/linkGuard'), 'LINK_GUARD');
