const { compareCommunityLayout } = require('../../domain/community/communityLayoutDiffEngine');
function assertPort(port) { if (!port || typeof port.readGuildSnapshot !== 'function') throw new TypeError('GuildSnapshotPort.readGuildSnapshot is required'); }
function createCommunityLayoutPreviewUseCase({ snapshotPort, bindingRepository, schema } = {}) {
  assertPort(snapshotPort);
  if (!bindingRepository || typeof bindingRepository.listChannelBindings !== 'function') throw new TypeError('ChannelBindingRepository.listChannelBindings is required');
  return Object.freeze({ async preview({ guildId }) { const [snapshot, channelBindings] = await Promise.all([snapshotPort.readGuildSnapshot({ guildId }), bindingRepository.listChannelBindings({ guildId })]); return Object.freeze({ snapshot, channelBindings, desired: schema, diff: compareCommunityLayout({ snapshot, schema, channelBindings }) }); } });
}
module.exports = { createCommunityLayoutPreviewUseCase };
