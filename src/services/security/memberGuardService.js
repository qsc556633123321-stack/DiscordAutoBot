const { createLegacyFacade } = require('../../core/serviceFacade');
module.exports = createLegacyFacade(require('../../systems/memberGuard'), 'MEMBER_GUARD');
