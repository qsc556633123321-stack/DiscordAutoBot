const { fail, ok } = require('../../core/result');
const { createCommunitySnapshot } = require('../../domain/community/communitySnapshot');
const { reconcileCommunity } = require('../../domain/community/communityReconciliation');
const { compareCommunityLayout } = require('../../domain/community/communityLayoutDiffEngine');
const { assertCommunitySnapshotRepositoryPort } = require('./ports/CommunitySnapshotRepositoryPort');

function createCommunityReconciliationPreviewUseCase({ snapshotPort, snapshotRepository, bindingRepository, desiredState, now = () => new Date().toISOString() } = {}) {
  if (typeof snapshotPort?.readGuildSnapshot !== 'function') throw new TypeError('GuildSnapshotPort.readGuildSnapshot is required');
  if (typeof bindingRepository?.listChannelBindings !== 'function') throw new TypeError('ChannelBindingRepository.listChannelBindings is required');
  assertCommunitySnapshotRepositoryPort(snapshotRepository);
  return Object.freeze({ async preview({ guildId } = {}) {
    try {
      const [rawSnapshot, channelBindings] = await Promise.all([snapshotPort.readGuildSnapshot({ guildId }), bindingRepository.listChannelBindings({ guildId })]);
      const snapshot = createCommunitySnapshot({ ...rawSnapshot, capturedAt: now() });
      const persistence = await snapshotRepository.saveSnapshot({ snapshot });
      return ok(Object.freeze({ snapshot, persistence, channelBindings: Object.freeze(channelBindings), desired: desiredState, diff: compareCommunityLayout({ snapshot, schema: desiredState, channelBindings }), reconciliation: reconcileCommunity({ snapshot, desiredState, channelBindings }) }));
    } catch (error) { return fail('COMMUNITY_PREVIEW_FAILED', error.message); }
  } });
}

module.exports = { createCommunityReconciliationPreviewUseCase };
