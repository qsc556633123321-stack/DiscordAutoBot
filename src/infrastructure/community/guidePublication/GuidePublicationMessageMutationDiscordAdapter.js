function assertSession(session) {
  if (!session || typeof session.editTrackedMessage !== 'function' || typeof session.sendMessage !== 'function') {
    throw new TypeError('GuidePublicationMessageMutationDiscordAdapter requires a session');
  }
}

function isError(value) {
  return value instanceof Error;
}

function createGuidePublicationMessageMutationDiscordAdapter({ session } = {}) {
  assertSession(session);

  return {
    async edit(request) {
      try {
        await session.editTrackedMessage(request.payload);
        return { kind: 'EditSuccess', messageId: request.messageId };
      } catch (error) {
        return {
          kind: 'Failure',
          failureKind: isError(error) ? 'EditRejected' : 'Unknown'
        };
      }
    },
    async send(request) {
      try {
        const message = await session.sendMessage(request.payload);
        if (!message || typeof message.id !== 'string' || !message.id) {
          return { kind: 'Failure', failureKind: 'MissingResource' };
        }
        return { kind: 'SendSuccess', messageId: message.id };
      } catch (error) {
        return {
          kind: 'Failure',
          failureKind: isError(error) ? 'SendRejected' : 'Unknown'
        };
      }
    }
  };
}

module.exports = { createGuidePublicationMessageMutationDiscordAdapter };
