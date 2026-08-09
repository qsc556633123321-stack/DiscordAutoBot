function assertEnsuredChannel(ensuredChannel) {
  if (!ensuredChannel || typeof ensuredChannel !== 'object') {
    throw new TypeError('GuidePublicationResourceSession requires an ensured channel');
  }
  if (!ensuredChannel.messages || typeof ensuredChannel.messages.fetch !== 'function') {
    throw new TypeError('GuidePublicationResourceSession requires channel.messages.fetch');
  }
  if (typeof ensuredChannel.send !== 'function') {
    throw new TypeError('GuidePublicationResourceSession requires channel.send');
  }
}

function createGuidePublicationResourceSession({ ensuredChannel } = {}) {
  assertEnsuredChannel(ensuredChannel);
  let retainedMessage = null;

  return {
    getChannelId() {
      return ensuredChannel.id;
    },
    getRetainedMessage() {
      return retainedMessage;
    },
    async lookupTrackedMessage(messageId) {
      try {
        const message = await ensuredChannel.messages.fetch(messageId);
        retainedMessage = message || null;
        return { available: Boolean(retainedMessage) };
      } catch (error) {
        retainedMessage = null;
        throw error;
      }
    },
    async editTrackedMessage(payload) {
      if (!retainedMessage) {
        throw new Error('GuidePublicationResourceSession requires a retained message before edit');
      }
      return retainedMessage.edit(payload);
    },
    async sendMessage(payload) {
      const sentMessage = await ensuredChannel.send(payload);
      retainedMessage = sentMessage;
      return sentMessage;
    }
  };
}

module.exports = { createGuidePublicationResourceSession };
