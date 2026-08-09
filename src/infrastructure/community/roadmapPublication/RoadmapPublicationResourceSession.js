function createRoadmapPublicationResourceSession({ ensuredChannel }) {
  if (
    !ensuredChannel?.id
    || typeof ensuredChannel?.messages?.fetch !== 'function'
    || typeof ensuredChannel?.send !== 'function'
  ) {
    throw new Error('RoadmapPublicationResourceSession requires an ensured channel with messages.fetch and send');
  }

  let retainedMessage = null;
  let hasMutationFailure = false;
  let retainedMutationFailure;

  function clearRetainedMutationFailure() {
    hasMutationFailure = false;
    retainedMutationFailure = undefined;
  }

  function retainMutationFailure(failure) {
    hasMutationFailure = true;
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
      return hasMutationFailure
        ? { hasFailure: true, failure: retainedMutationFailure }
        : { hasFailure: false };
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
    },
    async editTrackedMessage(payload) {
      if (!retainedMessage) {
        throw new Error('RoadmapPublicationResourceSession requires a retained message before edit');
      }

      clearRetainedMutationFailure();
      try {
        return await retainedMessage.edit(payload);
      } catch (failure) {
        retainMutationFailure(failure);
        throw failure;
      }
    },
    async sendMessage(payload) {
      clearRetainedMutationFailure();
      try {
        const sentMessage = await ensuredChannel.send(payload);
        retainedMessage = sentMessage;
        return sentMessage;
      } catch (failure) {
        retainMutationFailure(failure);
        throw failure;
      }
    }
  };
}

module.exports = { createRoadmapPublicationResourceSession };
