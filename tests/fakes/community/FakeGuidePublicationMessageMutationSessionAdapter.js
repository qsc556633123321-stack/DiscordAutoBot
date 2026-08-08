const {
  createGuidePublicationMessageEditSuccess,
  createGuidePublicationMessageSendSuccess,
  createGuidePublicationMessageMutationFailure
} = require('../../../src/application/community/guideDiscordMutation/GuidePublicationMessageMutationResult');
const { GuidePublicationMessageMutationFailure } = require('../../../src/application/community/guideDiscordMutation/GuidePublicationMessageMutationFailure');

function assertSession(session) {
  if (!session || typeof session.editTrackedMessage !== 'function' || typeof session.sendMessage !== 'function') {
    throw new TypeError('GuidePublicationMessageMutationSessionAdapter requires a session');
  }
}

function isError(value) {
  return value instanceof Error;
}

function createFakeGuidePublicationMessageMutationSessionAdapter({ session } = {}) {
  assertSession(session);

  return {
    async edit(request) {
      try {
        await session.editTrackedMessage(request.payload);
        return createGuidePublicationMessageEditSuccess({ messageId: request.messageId });
      } catch (error) {
        return createGuidePublicationMessageMutationFailure({
          failureKind: isError(error)
            ? GuidePublicationMessageMutationFailure.EditRejected
            : GuidePublicationMessageMutationFailure.Unknown
        });
      }
    },
    async send(request) {
      try {
        const message = await session.sendMessage(request.payload);
        if (!message || typeof message.id !== 'string' || !message.id) {
          return createGuidePublicationMessageMutationFailure({
            failureKind: GuidePublicationMessageMutationFailure.MissingResource
          });
        }
        return createGuidePublicationMessageSendSuccess({ messageId: message.id });
      } catch (error) {
        return createGuidePublicationMessageMutationFailure({
          failureKind: isError(error)
            ? GuidePublicationMessageMutationFailure.SendRejected
            : GuidePublicationMessageMutationFailure.Unknown
        });
      }
    }
  };
}

module.exports = { createFakeGuidePublicationMessageMutationSessionAdapter };
