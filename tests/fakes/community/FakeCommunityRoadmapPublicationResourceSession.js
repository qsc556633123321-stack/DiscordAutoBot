function createFakeCommunityRoadmapPublicationResourceSession({ ensuredChannel }) {
  let retainedMessage = null;
  return {
    getChannelId() { return ensuredChannel.id; },
    getRetainedMessage() { return retainedMessage; },
    async lookupTrackedMessage(messageId) {
      if (!messageId) { retainedMessage = null; return { kind: 'Unavailable' }; }
      try {
        retainedMessage = await ensuredChannel.messages.fetch(messageId);
        return retainedMessage ? { kind: 'Available', messageId } : { kind: 'Unavailable' };
      } catch (_) {
        retainedMessage = null;
        return { kind: 'Unavailable' };
      }
    }
  };
}
module.exports = { createFakeCommunityRoadmapPublicationResourceSession };
