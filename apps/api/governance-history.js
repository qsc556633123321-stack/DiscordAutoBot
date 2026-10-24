const { createGovernanceHistoryFeature } = require('../../src/composition/governanceHistoryFeature');
function getGovernanceHistory(guildId) { return createGovernanceHistoryFeature().getHistory({ guildId }); }
module.exports = { getGovernanceHistory };
