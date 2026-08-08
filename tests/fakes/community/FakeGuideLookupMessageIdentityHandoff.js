const { GuidePublicationMessageLookupStatus } = require('../../../src/application/community/guideLookup/GuidePublicationMessageLookupStatus');

function createFakeGuideLookupMessageIdentityHandoff({ fetchMessage } = {}) {
  if (typeof fetchMessage !== 'function') throw new TypeError('fetchMessage is required');
  let retainedMessage = null;

  return {
    async lookup(messageId) {
      try {
        const message = await fetchMessage(messageId);
        retainedMessage = message || null;
        return retainedMessage
          ? { status: GuidePublicationMessageLookupStatus.MessageAvailable, messageId }
          : { status: GuidePublicationMessageLookupStatus.MessageUnavailable, messageId };
      } catch {
        retainedMessage = null;
        return { status: GuidePublicationMessageLookupStatus.MessageUnavailable, messageId };
      }
    },
    handoffRetainedMessage() {
      return retainedMessage;
    }
  };
}

module.exports = { createFakeGuideLookupMessageIdentityHandoff };
