function createFakeCommunityRoadmapLookupBoundary({ channel }) {
  let retainedMessage = null;
  return {
    async lookup({ messageId }) {
      if (!messageId) return { kind: 'Unavailable' };
      try {
        retainedMessage = await channel.messages.fetch(messageId);
        return retainedMessage ? { kind: 'Available', messageId } : { kind: 'Unavailable' };
      } catch (_) {
        retainedMessage = null;
        return { kind: 'Unavailable' };
      }
    },
    getRetainedMessage() { return retainedMessage; }
  };
}

module.exports = { createFakeCommunityRoadmapLookupBoundary };
