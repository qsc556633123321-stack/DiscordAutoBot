function requireMessageId(messageId) {
  if (typeof messageId !== 'string' || !messageId) throw new Error('messageId is required');
  return messageId;
}

function createEditSuccess(messageId) {
  return Object.freeze({ kind: 'EditSuccess', messageId: requireMessageId(messageId) });
}

function createSendSuccess(messageId) {
  return Object.freeze({ kind: 'SendSuccess', messageId: requireMessageId(messageId) });
}

function createFakeCommunityRoadmapMutationPort(options = {}) {
  const {
    editMessageId = 'tracked-message',
    sendMessageId = 'sent-message',
    editRejection,
    sendRejection
  } = options;
  const hasEditRejection = Object.prototype.hasOwnProperty.call(options, 'editRejection');
  const hasSendRejection = Object.prototype.hasOwnProperty.call(options, 'sendRejection');
  const calls = [];
  return {
    calls,
    async edit(request) {
      calls.push({ method: 'edit', request });
      if (hasEditRejection) throw editRejection;
      return createEditSuccess(request.messageId || editMessageId);
    },
    async send(request) {
      calls.push({ method: 'send', request });
      if (hasSendRejection) throw sendRejection;
      return createSendSuccess(sendMessageId);
    }
  };
}

module.exports = {
  createEditSuccess,
  createSendSuccess,
  createFakeCommunityRoadmapMutationPort
};
