const { createCommunityMigrationReadinessUseCase } = require('../application/community/createCommunityMigrationReadinessUseCase');
const { createJsonCommunityCompatibilityReader } = require('../infrastructure/storage/jsonCommunityCompatibilityRepository');
const { createSupabaseCommunityCompatibilityReader } = require('../infrastructure/storage/supabaseCommunityReadRepositories');
function createCommunityRepositoryMigrationReadinessFeature({ jsonReader = createJsonCommunityCompatibilityReader(), databaseReader = createSupabaseCommunityCompatibilityReader() } = {}) { return createCommunityMigrationReadinessUseCase({ jsonReader, databaseReader }); }
module.exports = { createCommunityRepositoryMigrationReadinessFeature };
