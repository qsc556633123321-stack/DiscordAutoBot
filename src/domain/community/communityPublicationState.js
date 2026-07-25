function normalizeOptionalId(value) {
  return typeof value === 'string' && value.trim() ? value : null;
}

function createGuidePublicationState({ channelId, messageId } = {}) {
  return Object.freeze({ channelId: normalizeOptionalId(channelId), messageId: normalizeOptionalId(messageId) });
}

function createRoadmapPublicationState({ channelId, messageId } = {}) {
  return Object.freeze({ channelId: normalizeOptionalId(channelId), messageId: normalizeOptionalId(messageId) });
}

function createCommunityPublicationState({ guildId, guide, roadmap } = {}) {
  if (typeof guildId !== 'string' || !guildId.trim()) throw new Error('guildId is required');
  return Object.freeze({
    guildId,
    guide: createGuidePublicationState(guide),
    roadmap: createRoadmapPublicationState(roadmap)
  });
}

module.exports = { createCommunityPublicationState, createGuidePublicationState, createRoadmapPublicationState, normalizeOptionalId };
