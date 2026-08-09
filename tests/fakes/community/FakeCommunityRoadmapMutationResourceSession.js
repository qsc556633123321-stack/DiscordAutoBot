function createFakeCommunityRoadmapMutationResourceSession({ ensuredChannel } = {}) {
  if (!ensuredChannel?.id || typeof ensuredChannel?.messages?.fetch !== 'function' || typeof ensuredChannel?.send !== 'function') {
    throw new Error('FakeCommunityRoadmapMutationResourceSession requires an ensured channel with fetch and send');
  }

  let retainedMessage = null;
  let hasFailure = false;
  let failure;

  function clearFailure() {
    hasFailure = false;
    failure = undefined;
  }

  function retainFailure(rejection) {
    hasFailure = true;
    failure = rejection;
  }

  return {
    getChannelId() {
      return ensuredChannel.id;
    },
    getRetainedMessage() {
      return retainedMessage;
    },
    getRetainedMutationFailure() {
      return hasFailure ? { hasFailure: true, failure } : { hasFailure: false };
    },
    async lookupTrackedMessage(messageId) {
      if (!messageId) {
        retainedMessage = null;
        return { kind: 'Unavailable' };
      }
      try {
        const message = await ensuredChannel.messages.fetch(messageId);
        retainedMessage = message || null;
        return retainedMessage ? { kind: 'Available', messageId } : { kind: 'Unavailable' };
      } catch (_) {
        retainedMessage = null;
        return { kind: 'Unavailable' };
      }
    },
    async editTrackedMessage(payload) {
      if (!retainedMessage) throw new Error('FakeCommunityRoadmapMutationResourceSession requires a retained message before edit');
      clearFailure();
      try {
        return await retainedMessage.edit(payload);
      } catch (rejection) {
        retainFailure(rejection);
        throw rejection;
      }
    },
    async sendMessage(payload) {
      clearFailure();
      try {
        const sentMessage = await ensuredChannel.send(payload);
        retainedMessage = sentMessage;
        return sentMessage;
      } catch (rejection) {
        retainFailure(rejection);
        throw rejection;
      }
    }
  };
}

module.exports = { createFakeCommunityRoadmapMutationResourceSession };
