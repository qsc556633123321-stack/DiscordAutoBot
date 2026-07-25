const { createCommunityPublicationState } = require('../../domain/community/communityPublicationState');

function fromLegacyPublicationRecord(guildId, record = {}) {
  const source = record && typeof record === 'object' && !Array.isArray(record) ? record : {};
  return createCommunityPublicationState({
    guildId,
    guide: { channelId: source.guideChannelId, messageId: source.guideMessageId },
    roadmap: { channelId: source.roadmapChannelId, messageId: source.roadmapMessageId }
  });
}

function toLegacyPublicationPatch(state) {
  const patch = {};
  if (state.guide.channelId) patch.guideChannelId = state.guide.channelId;
  if (state.guide.messageId) patch.guideMessageId = state.guide.messageId;
  if (state.roadmap.channelId) patch.roadmapChannelId = state.roadmap.channelId;
  if (state.roadmap.messageId) patch.roadmapMessageId = state.roadmap.messageId;
  return Object.freeze(patch);
}

module.exports = { fromLegacyPublicationRecord, toLegacyPublicationPatch };
