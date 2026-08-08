function assertSession(session) {
  if (!session || typeof session.lookupTrackedMessage !== 'function') {
    throw new TypeError('GuidePublicationMessageLookupDiscordAdapter requires a session');
  }
}

function createGuidePublicationMessageLookupDiscordAdapter({ session } = {}) {
  assertSession(session);

  return {
    async lookup(request) {
      try {
        const outcome = await session.lookupTrackedMessage(request.messageId);
        return outcome && outcome.available
          ? { status: 'MessageAvailable', messageId: request.messageId }
          : { status: 'MessageUnavailable', messageId: request.messageId };
      } catch {
        return { status: 'MessageUnavailable', messageId: request.messageId };
      }
    }
  };
}

module.exports = { createGuidePublicationMessageLookupDiscordAdapter };
