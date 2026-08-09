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
  let hasRetainedMutationFailure = false;
  let retainedMutationFailure;

  function clearRetainedMutationFailure() {
    hasRetainedMutationFailure = false;
    retainedMutationFailure = undefined;
  }

  function retainMutationFailure(failure) {
    hasRetainedMutationFailure = true;
    retainedMutationFailure = failure;
  }

  return {
    getChannelId() {
      return ensuredChannel.id;
    },
    getRetainedMessage() {
      return retainedMessage;
    },
    getRetainedMutationFailure() {
      return hasRetainedMutationFailure
        ? { hasFailure: true, failure: retainedMutationFailure }
        : { hasFailure: false };
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
      clearRetainedMutationFailure();
      try {
        return await retainedMessage.edit(payload);
      } catch (error) {
        retainMutationFailure(error);
        throw error;
      }
    },
    async sendMessage(payload) {
      clearRetainedMutationFailure();
      try {
        const sentMessage = await ensuredChannel.send(payload);
        retainedMessage = sentMessage;
        return sentMessage;
      } catch (error) {
        retainMutationFailure(error);
        throw error;
      }
    }
  };
}

module.exports = { createGuidePublicationResourceSession };
