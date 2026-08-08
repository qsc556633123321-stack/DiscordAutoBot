const {
  createLookupSkipped,
  createMessageAvailable,
  createMessageUnavailable
} = require('../../../src/application/community/guideLookup/GuidePublicationMessageLookupResult');

function createFakeGuidePublicationMessageLookupPort(results = []) {
  const calls = [];
  const queue = [...results];
  return {
    calls,
    lookup(request) {
      calls.push(request);
      return queue.length > 0 ? queue.shift() : createLookupSkipped({ messageId: request.messageId });
    },
    skipped(messageId) {
      return createLookupSkipped({ messageId });
    },
    available(messageId) {
      return createMessageAvailable({ messageId });
    },
    unavailable(messageId) {
      return createMessageUnavailable({ messageId });
    }
  };
}

module.exports = { createFakeGuidePublicationMessageLookupPort };
