const { createCommunityLayoutPreviewUseCase } = require('../application/community/createCommunityLayoutPreviewUseCase');
const { buildFullGuildDesiredState } = require('../domain/community/serverGovernanceDesiredState');
const { findGameIdentity } = require('../domain/games/gameIdentityService');
const { createDiscordGuildSnapshotAdapter } = require('../infrastructure/discord/discordGuildSnapshotAdapter');

function resolveKnownGameCanonicalId(channel) {
  if (!channel.name) return null;
  const identity = findGameIdentity(channel.name);
  return identity.custom ? null : identity.id;
}

function createCommunityLayoutPreviewFeature({ resolveGuild, bindingRepository, now } = {}) {
  const snapshotPort = createDiscordGuildSnapshotAdapter({ resolveGuild, now, resolveGameCanonicalId: resolveKnownGameCanonicalId });
  return createCommunityLayoutPreviewUseCase({
    snapshotPort,
    bindingRepository,
    schema: buildFullGuildDesiredState()
  });
}

module.exports = { createCommunityLayoutPreviewFeature };
