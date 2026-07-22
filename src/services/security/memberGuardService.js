const { createMemberGuardFeature } = require('../../composition/memberGuardFeature');

// Active runtime facade. Legacy systems remain untouched as rollback sources.
module.exports = createMemberGuardFeature().runtime;
