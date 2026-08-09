const {
  createRoadmapPublicationMessageEditSuccess,
  createRoadmapPublicationMessageSendSuccess
} = require('../../../src/application/community/roadmapPublication/RoadmapPublicationMessageMutationPort');

function assertResourceSession(resourceSession) {
  const requiredMethods = [
    'getRetainedMessage',
    'getRetainedMutationFailure',
    'editTrackedMessage',
    'sendMessage'
  ];
  if (!resourceSession || requiredMethods.some((method) => typeof resourceSession[method] !== 'function')) {
    throw new TypeError('RoadmapPublicationMessageMutationAdapter requires a resourceSession');
  }
}

function assertRetainedMessage(message) {
  if (!message || typeof message.id !== 'string' || !message.id) {
    throw new Error('RoadmapPublicationMessageMutationAdapter requires a retained message with an id');
  }
}

function assertSentMessage(message) {
  if (!message || typeof message.id !== 'string' || !message.id) {
    throw new Error('RoadmapPublicationMessageMutationAdapter requires a sent message with an id');
  }
}

function createFakeProductionShapeRoadmapMutationAdapter({ resourceSession } = {}) {
  assertResourceSession(resourceSession);

  return {
    async edit(request) {
      const retainedMessage = resourceSession.getRetainedMessage();
      assertRetainedMessage(retainedMessage);
      if (request?.messageId !== retainedMessage.id) {
        throw new Error('RoadmapPublicationMessageMutationAdapter requires request.messageId to match the retained message');
      }

      await resourceSession.editTrackedMessage(request.payload);
      return createRoadmapPublicationMessageEditSuccess({ messageId: retainedMessage.id });
    },
    async send(request) {
      const sentMessage = await resourceSession.sendMessage(request?.payload);
      assertSentMessage(sentMessage);
      return createRoadmapPublicationMessageSendSuccess({ messageId: sentMessage.id });
    }
  };
}

module.exports = { createFakeProductionShapeRoadmapMutationAdapter };
