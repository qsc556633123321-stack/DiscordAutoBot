const {
  createGuidePublicationMessageEditSuccess,
  createGuidePublicationMessageSendSuccess,
  createGuidePublicationMessageMutationFailure
} = require('../../../src/application/community/guideDiscordMutation/GuidePublicationMessageMutationResult');

function createFakeGuidePublicationMessageMutationPort({ editResult, sendResult } = {}) {
  const calls = [];
  return {
    calls,
    edit(request) {
      calls.push({ method: 'edit', request });
      return editResult || createGuidePublicationMessageEditSuccess({ messageId: request.messageId });
    },
    send(request) {
      calls.push({ method: 'send', request });
      return sendResult || createGuidePublicationMessageSendSuccess({ messageId: 'generated-message-id' });
    },
    fail(failureKind) {
      return createGuidePublicationMessageMutationFailure({ failureKind });
    }
  };
}

module.exports = { createFakeGuidePublicationMessageMutationPort };
