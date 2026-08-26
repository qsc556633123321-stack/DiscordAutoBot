const { buildFullGuildDesiredState } = require('../domain/community/serverGovernanceDesiredState');
const { ROLES } = require('../domain/community/communityArchitectureV3');
const GAME_REGISTRY = require('../domain/games/gameRegistry');
const { getGameRoleKey, getGameRoleName } = require('../domain/games/gameAccessPolicy');
const { createServerGovernanceExecutionUseCase } = require('../application/community/serverGovernanceExecutionUseCase');
const { createDiscordGuildStructureMutationGateway } = require('../infrastructure/discord/discordGuildStructureMutationGateway');

function createServerGovernanceExecutionFeature({ resolveGuild, classifyResource } = {}) {
  const roleNames = Object.freeze({ everyone: '@everyone', ...Object.fromEntries(ROLES.map((role) => [role.key, role.name])), ...Object.fromEntries(GAME_REGISTRY.map((game) => [getGameRoleKey(game.id), getGameRoleName(game)])) });
  const mutationGateway = createDiscordGuildStructureMutationGateway({ resolveGuild, classifyResource, roleNames });
  return Object.freeze({ serverGovernanceExecution: createServerGovernanceExecutionUseCase({ mutationGateway, desiredState: buildFullGuildDesiredState() }) });
}
module.exports = { createServerGovernanceExecutionFeature };
