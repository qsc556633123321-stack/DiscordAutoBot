const { GuidePublicationMessageLookupStatus } = require('./GuidePublicationMessageLookupStatus');

function createResult(status, messageId) {
  return Object.freeze({ status, messageId });
}

function createLookupSkipped({ messageId } = {}) {
  return createResult(GuidePublicationMessageLookupStatus.LookupSkipped, messageId);
}

function createMessageAvailable({ messageId } = {}) {
  return createResult(GuidePublicationMessageLookupStatus.MessageAvailable, messageId);
}

function createMessageUnavailable({ messageId } = {}) {
  return createResult(GuidePublicationMessageLookupStatus.MessageUnavailable, messageId);
}

module.exports = {
  createLookupSkipped,
  createMessageAvailable,
  createMessageUnavailable
};
