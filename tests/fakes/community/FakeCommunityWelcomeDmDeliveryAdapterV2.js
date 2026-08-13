function createCommunityWelcomeDmDeliveryAdapter({ member } = {}) {
  if (typeof member?.send !== 'function') {
    throw new TypeError('CommunityWelcomeDmDeliveryAdapter requires member.send');
  }

  return Object.freeze({
    async send(payload) {
      return member.send(payload).catch(() => null);
    }
  });
}

module.exports = { createCommunityWelcomeDmDeliveryAdapter };
