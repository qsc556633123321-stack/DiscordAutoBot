const { createGameRoleSelectionUseCase } = require('../application/games/gameRoleSelectionUseCase');
const { createDiscordGameRoleSelectionGateway } = require('../infrastructure/discord/discordGameRoleSelectionGateway');
const GAME_REGISTRY = require('../domain/games/gameRegistry');
const { getGameRoleKey, getGameRoleName } = require('../domain/games/gameAccessPolicy');
const { ROLES } = require('../domain/community/communityArchitectureV3');

const parentGameRoleName = ROLES.find((role) => role.key === 'game').name;

function createGameRoleSelectionFeature({ resolveGuild, resolveMember } = {}) {
  const gateway = createDiscordGameRoleSelectionGateway({
    resolveGuild,
    resolveMember,
    gameRegistry: GAME_REGISTRY,
    parentGameRoleName,
    getGameRoleKey,
    getGameRoleName
  });
  return Object.freeze({ gameRoleSelection: createGameRoleSelectionUseCase({ gateway }) });
}

module.exports = { createGameRoleSelectionFeature };
