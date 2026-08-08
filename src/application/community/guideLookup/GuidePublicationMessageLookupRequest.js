function requireIdentity(value, field) {
  if (typeof value !== 'string' || !value) throw new Error(`${field} is required`);
  return value;
}

function createGuidePublicationMessageLookupRequest(input = {}) {
  if (!Object.prototype.hasOwnProperty.call(input, 'messageId')) throw new Error('messageId is required');
  return Object.freeze({
    guildId: requireIdentity(input.guildId, 'guildId'),
    channelId: requireIdentity(input.channelId, 'channelId'),
    messageId: input.messageId
  });
}

module.exports = { createGuidePublicationMessageLookupRequest };
