const { assertCommunityPublicationRecordRepository } = require('./ports/communityPublicationRecordRepository');

function assertGuildId(guildId) {
  if (typeof guildId !== 'string' || !guildId.trim()) throw new Error('guildId is required');
  return guildId;
}

function assertPatch(patch) {
  if (!patch || typeof patch !== 'object' || Array.isArray(patch)) {
    throw new Error('patch must be an object');
  }
  return patch;
}

function createPersistCommunityPublicationRecordUseCase({ repository, now = () => new Date().toISOString() } = {}) {
  assertCommunityPublicationRecordRepository(repository);

  return {
    execute({ guildId, patch } = {}) {
      return repository.mergeRecord({
        guildId: assertGuildId(guildId),
        patch: assertPatch(patch),
        updatedAt: now()
      });
    }
  };
}

module.exports = { createPersistCommunityPublicationRecordUseCase };
