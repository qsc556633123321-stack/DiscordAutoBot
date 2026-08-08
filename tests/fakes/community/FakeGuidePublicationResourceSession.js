function createFakeGuidePublicationResourceSession({ channel, message, lookupError } = {}) {
  const calls = [];
  let retainedMessage = null;

  return {
    calls,
    get channel() {
      return channel;
    },
    get retainedMessage() {
      return retainedMessage;
    },
    async lookupTrackedMessage(messageId) {
      calls.push({ method: 'lookupTrackedMessage', messageId, channel });
      if (lookupError) throw lookupError;
      retainedMessage = message || null;
      return retainedMessage;
    },
    async editTrackedMessage(payload) {
      calls.push({ method: 'editTrackedMessage', payload, message: retainedMessage });
      if (!retainedMessage) throw new Error('No retained guide message is available');
      return retainedMessage.edit(payload);
    },
    async sendMessage(payload) {
      calls.push({ method: 'sendMessage', payload, channel });
      return channel.send(payload);
    }
  };
}

module.exports = { createFakeGuidePublicationResourceSession };
