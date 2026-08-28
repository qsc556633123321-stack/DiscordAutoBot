const { buildFullGuildDesiredState } = require('../domain/community/serverGovernanceDesiredState');
const { createFullGuildGovernancePreviewUseCase } = require('../application/community/createServerGovernancePlanUseCase');
const { createDiscordGuildChannelInventoryAdapter } = require('../infrastructure/discord/discordGuildChannelInventoryAdapter');
const { createServerGovernanceResourceIdentityPolicy } = require('../domain/community/serverGovernanceResourceIdentityPolicy');

function createServerGovernancePreviewFeature({ resolveGuild, classifyResource } = {}) {
  const desiredState = buildFullGuildDesiredState();
  const resourceIdentityPolicy = createServerGovernanceResourceIdentityPolicy({ desiredState });
  const inventoryPort = createDiscordGuildChannelInventoryAdapter({ resolveGuild, classifyResource, classifyInventory: resourceIdentityPolicy.classifyInventory });
  return Object.freeze({ serverGovernancePreview: createFullGuildGovernancePreviewUseCase({ inventoryPort, desiredState }) });
}
module.exports = { createServerGovernancePreviewFeature };
