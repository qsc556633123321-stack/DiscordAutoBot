const { createLegacyFacade } = require('../../core/serviceFacade');
module.exports = createLegacyFacade(require('../../systems/communityConcierge'), 'COMMUNITY_GUIDE');
