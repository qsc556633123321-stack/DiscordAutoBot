const { createCommunityRoleQuickActionUseCase } = require('../application/community/communityRoleQuickActionUseCase');
const { createCommunityRoleMutationGateway } = require('../infrastructure/discord/communityRoleMutationGateway');

function createCommunityRoleQuickActionFeature({ resolveGuild, resolveMember } = {}) {
  const roleMutationGateway = createCommunityRoleMutationGateway({ resolveGuild, resolveMember });
  return Object.freeze({
    communityRoleQuickAction: createCommunityRoleQuickActionUseCase({ roleMutationGateway })
  });
}

module.exports = { createCommunityRoleQuickActionFeature };
