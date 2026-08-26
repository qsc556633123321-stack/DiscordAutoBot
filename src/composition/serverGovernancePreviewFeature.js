const { buildFullGuildDesiredState } = require('../domain/community/serverGovernanceDesiredState');
const { createFullGuildGovernancePreviewUseCase } = require('../application/community/createServerGovernancePlanUseCase');
const { createDiscordGuildChannelInventoryAdapter } = require('../infrastructure/discord/discordGuildChannelInventoryAdapter');

function createServerGovernancePreviewFeature({ resolveGuild, classifyResource } = {}) {
  const desiredState = buildFullGuildDesiredState();
  const inventoryPort = createDiscordGuildChannelInventoryAdapter({ resolveGuild, classifyResource });
  return Object.freeze({ serverGovernancePreview: createFullGuildGovernancePreviewUseCase({ inventoryPort, desiredState }) });
}
module.exports = { createServerGovernancePreviewFeature };
