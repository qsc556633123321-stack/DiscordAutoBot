function requireIdentity(value, field) {
  if (typeof value !== 'string' || !value) throw new Error(`${field} is required`);
  return value;
}

function createGuidePublicationMessageEditRequest(input = {}) {
  if (!Object.prototype.hasOwnProperty.call(input, 'payload')) throw new Error('payload is required');
  return Object.freeze({
    guildId: requireIdentity(input.guildId, 'guildId'),
    channelId: requireIdentity(input.channelId, 'channelId'),
    messageId: requireIdentity(input.messageId, 'messageId'),
    payload: input.payload
  });
}

module.exports = { createGuidePublicationMessageEditRequest };
