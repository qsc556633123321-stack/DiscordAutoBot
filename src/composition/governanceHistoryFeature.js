const { createJsonGovernanceRepositories } = require('../infrastructure/storage/jsonGovernanceRepository');
const { createGovernanceHistoryUseCase } = require('../application/community/getGovernanceHistoryUseCase');
function createGovernanceHistoryFeature({ repositories = createJsonGovernanceRepositories() } = {}) { return createGovernanceHistoryUseCase(repositories); }
module.exports = { createGovernanceHistoryFeature };
