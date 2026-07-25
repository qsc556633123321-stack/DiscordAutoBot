const { createCommunityPublicationState } = require('../../domain/community/communityPublicationState');

function fromLegacyPublicationRecord(guildId, record = {}) {
  return createCommunityPublicationState({
    guildId,
    guide: { channelId: record.guideChannelId, messageId: record.guideMessageId },
    roadmap: { channelId: record.roadmapChannelId, messageId: record.roadmapMessageId }
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
