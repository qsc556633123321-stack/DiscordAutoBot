function assertDiscordGuildStructureMutationGateway(gateway) {
  for (const method of ['readExecutionSnapshot', 'createCategory', 'createTextChannel', 'createVoiceChannel', 'moveChannel', 'renameChannel', 'applyCategoryPermissions', 'applyChannelPermissions', 'deleteChannel', 'deleteCategory']) {
    if (typeof gateway?.[method] !== 'function') throw new TypeError(`DiscordGuildStructureMutationGateway requires ${method}`);
  }
  return gateway;
}
module.exports = { assertDiscordGuildStructureMutationGateway };
