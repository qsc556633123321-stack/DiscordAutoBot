function assertCommunityRoleMutationGateway(gateway) {
  if (!gateway || typeof gateway.addRole !== 'function') {
    throw new TypeError('CommunityRoleQuickActionUseCase requires roleMutationGateway.addRole');
  }
}

module.exports = { assertCommunityRoleMutationGateway };
