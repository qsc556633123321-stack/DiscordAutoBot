const { createCommunityReconciliationPreviewUseCase } = require('../application/community/createCommunityReconciliationPreviewUseCase');
const { buildFullGuildDesiredState } = require('../domain/community/serverGovernanceDesiredState');
const { findGameIdentity } = require('../domain/games/gameIdentityService');
const { createDiscordGuildSnapshotAdapter } = require('../infrastructure/discord/discordGuildSnapshotAdapter');
const { createJsonCommunitySnapshotRepository } = require('../infrastructure/storage/jsonCommunitySnapshotRepository');

function resolveKnownGameCanonicalId(channel) {
  if (!channel.name) return null;
  const identity = findGameIdentity(channel.name);
  return identity.custom ? null : identity.id;
}

function createCommunityReconciliationPreviewFeature({ resolveGuild, bindingRepository, snapshotRepository = createJsonCommunitySnapshotRepository(), now } = {}) {
  const snapshotPort = createDiscordGuildSnapshotAdapter({ resolveGuild, resolveGameCanonicalId: resolveKnownGameCanonicalId, now });
  return createCommunityReconciliationPreviewUseCase({ snapshotPort, snapshotRepository, bindingRepository, desiredState: buildFullGuildDesiredState(), now });
}

module.exports = { createCommunityReconciliationPreviewFeature };
