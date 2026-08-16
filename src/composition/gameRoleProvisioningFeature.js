const { createGameRoleProvisioningUseCase } = require('../application/games/gameRoleProvisioningUseCase');
const { createDiscordGameRoleProvisioningGateway } = require('../infrastructure/discord/discordGameRoleProvisioningGateway');

function createGameRoleProvisioningFeature({ resolveGuild } = {}) {
  const gateway = createDiscordGameRoleProvisioningGateway({ resolveGuild });
  return Object.freeze({
    gameRoleProvisioning: createGameRoleProvisioningUseCase({ gateway })
  });
}

module.exports = { createGameRoleProvisioningFeature };
