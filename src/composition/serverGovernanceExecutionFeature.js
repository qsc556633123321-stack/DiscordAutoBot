const { buildFullGuildDesiredState } = require('../domain/community/serverGovernanceDesiredState');
const { ROLES } = require('../domain/community/communityArchitectureV3');
const GAME_REGISTRY = require('../domain/games/gameRegistry');
const { getGameRoleKey, getGameRoleName } = require('../domain/games/gameAccessPolicy');
const { createServerGovernanceExecutionUseCase } = require('../application/community/serverGovernanceExecutionUseCase');
const { createDiscordGuildStructureMutationGateway } = require('../infrastructure/discord/discordGuildStructureMutationGateway');
const { createDiscordGuildChannelInventoryAdapter } = require('../infrastructure/discord/discordGuildChannelInventoryAdapter');
const { createServerGovernanceIdentityResolver } = require('../infrastructure/discord/serverGovernanceIdentityResolver');
const { createServerGovernanceResourceIdentityPolicy } = require('../domain/community/serverGovernanceResourceIdentityPolicy');

function createServerGovernanceExecutionFeature({ resolveGuild, classifyResource } = {}) {
  const roleNames = Object.freeze({ everyone: '@everyone', ...Object.fromEntries(ROLES.map((role) => [role.key, role.name])), ...Object.fromEntries(GAME_REGISTRY.map((game) => [getGameRoleKey(game.id), getGameRoleName(game)])) });
  const desiredState = buildFullGuildDesiredState();
  const identityResolver = createServerGovernanceIdentityResolver({ roleNames });
  const resourceIdentityPolicy = createServerGovernanceResourceIdentityPolicy({ desiredState });
  const mutationGateway = createDiscordGuildStructureMutationGateway({ resolveGuild, classifyResource, roleNames, classifyInventory: resourceIdentityPolicy.classifyInventory, resolveRolesByKey: identityResolver.resolveRolesByKey });
  const inventoryPort = createDiscordGuildChannelInventoryAdapter({ resolveGuild, classifyResource, classifyInventory: resourceIdentityPolicy.classifyInventory });
  return Object.freeze({ serverGovernanceExecution: createServerGovernanceExecutionUseCase({ mutationGateway, desiredState }), readGuildInventory: (request) => inventoryPort.readGuildInventory(request) });
}
module.exports = { createServerGovernanceExecutionFeature };
