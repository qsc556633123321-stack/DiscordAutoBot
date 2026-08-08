const {
  createMessageAvailable,
  createMessageUnavailable
} = require('../../../src/application/community/guideLookup/GuidePublicationMessageLookupResult');

function createFakeGuidePublicationMessageLookupSessionAdapter({ session } = {}) {
  if (!session || typeof session.lookupTrackedMessage !== 'function') {
    throw new TypeError('GuidePublicationMessageLookupSessionAdapter requires a session');
  }

  return {
    async lookup(request) {
      try {
        const outcome = await session.lookupTrackedMessage(request.messageId);
        return outcome && outcome.available
          ? createMessageAvailable({ messageId: request.messageId })
          : createMessageUnavailable({ messageId: request.messageId });
      } catch {
        return createMessageUnavailable({ messageId: request.messageId });
      }
    }
  };
}

module.exports = { createFakeGuidePublicationMessageLookupSessionAdapter };
