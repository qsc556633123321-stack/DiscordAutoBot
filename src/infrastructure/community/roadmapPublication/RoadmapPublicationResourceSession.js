function createRoadmapPublicationResourceSession({ ensuredChannel }) {
  if (!ensuredChannel?.id || typeof ensuredChannel?.messages?.fetch !== 'function') {
    throw new Error('RoadmapPublicationResourceSession requires an ensured channel with messages.fetch');
  }

  let retainedMessage = null;

  return {
    getChannelId() {
      return ensuredChannel.id;
    },
    getRetainedMessage() {
      return retainedMessage;
    },
    async lookupTrackedMessage(messageId) {
      if (!messageId) {
        retainedMessage = null;
        return { kind: 'Unavailable' };
      }

      try {
        const message = await ensuredChannel.messages.fetch(messageId);
        if (!message) {
          retainedMessage = null;
          return { kind: 'Unavailable' };
        }
        retainedMessage = message;
        return { kind: 'Available', messageId };
      } catch (_) {
        retainedMessage = null;
        return { kind: 'Unavailable' };
      }
    }
  };
}

module.exports = { createRoadmapPublicationResourceSession };
