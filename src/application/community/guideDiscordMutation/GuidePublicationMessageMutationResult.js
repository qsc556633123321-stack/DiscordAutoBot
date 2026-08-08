function requireMessageId(messageId) {
  if (typeof messageId !== 'string' || !messageId) throw new Error('messageId is required');
  return messageId;
}

function createGuidePublicationMessageEditSuccess({ messageId } = {}) {
  return Object.freeze({ kind: 'EditSuccess', messageId: requireMessageId(messageId) });
}

function createGuidePublicationMessageSendSuccess({ messageId } = {}) {
  return Object.freeze({ kind: 'SendSuccess', messageId: requireMessageId(messageId) });
}

function createGuidePublicationMessageMutationFailure({ failureKind } = {}) {
  if (typeof failureKind !== 'string' || !failureKind) throw new Error('failureKind is required');
  return Object.freeze({ kind: 'Failure', failureKind });
}

module.exports = {
  createGuidePublicationMessageEditSuccess,
  createGuidePublicationMessageSendSuccess,
  createGuidePublicationMessageMutationFailure
};
