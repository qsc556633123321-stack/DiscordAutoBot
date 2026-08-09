function createFakeGuidePublicationAdapterPairWithMessageHandoff({ session, lookupPort, mutationPort } = {}) {
  if (!session || typeof session.getRetainedMessage !== 'function') throw new TypeError('session.getRetainedMessage is required');
  if (!lookupPort || !mutationPort) throw new TypeError('lookupPort and mutationPort are required');
  return {
    lookupPort,
    mutationPort,
    getRetainedMessage() {
      return session.getRetainedMessage();
    }
  };
}

module.exports = { createFakeGuidePublicationAdapterPairWithMessageHandoff };
