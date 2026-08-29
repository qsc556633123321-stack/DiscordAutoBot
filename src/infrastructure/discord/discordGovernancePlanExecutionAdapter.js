const { createDiscordGuildStructureMutationGateway } = require('./discordGuildStructureMutationGateway');

function createDiscordGovernancePlanExecutionAdapter(options = {}) {
  const gateway = createDiscordGuildStructureMutationGateway(options);
  async function inventory(guildId) { return (await gateway.readExecutionSnapshot({ guildId })).inventory; }
  return Object.freeze({
    readInventory: ({ guildId }) => inventory(guildId),
    async readResourceState({ guildId, resourceId }) { return (await inventory(guildId)).find((resource) => resource.id === resourceId) || null; },
    createCategory: ({ guildId, operation }) => gateway.createCategory({ guildId, target: { displayName: operation.expectedSnapshot?.name } }),
    createChannel: ({ guildId, operation }) => operation.expectedSnapshot?.type === 'voice' ? gateway.createVoiceChannel({ guildId, target: { displayName: operation.expectedSnapshot?.name, parentKey: operation.expectedSnapshot?.parentCanonicalKey } }) : gateway.createTextChannel({ guildId, target: { displayName: operation.expectedSnapshot?.name, parentKey: operation.expectedSnapshot?.parentCanonicalKey } }),
    moveResource: ({ guildId, resourceId, operation }) => gateway.moveChannel({ guildId, resourceId, parentKey: operation.expectedSnapshot?.parentCanonicalKey }),
    renameResource: ({ guildId, resourceId, operation }) => gateway.renameChannel({ guildId, resourceId, name: operation.expectedSnapshot?.name }),
    updatePermissions: ({ guildId, resourceId, operation }) => operation.expectedSnapshot?.type === 'category' ? gateway.applyCategoryPermissions({ guildId, resourceId, permission: operation.permission }) : gateway.applyChannelPermissions({ guildId, resourceId, permission: operation.permission }),
    deleteChannel: ({ guildId, resourceId }) => gateway.deleteChannel({ guildId, resourceId }),
    deleteCategory: ({ guildId, resourceId }) => gateway.deleteCategory({ guildId, resourceId })
  });
}
module.exports = { createDiscordGovernancePlanExecutionAdapter };
