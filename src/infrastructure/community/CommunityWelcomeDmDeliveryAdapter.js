function assertMember(member) {
  if (typeof member?.send !== 'function') {
    throw new TypeError('CommunityWelcomeDmDeliveryAdapter requires member.send');
  }
}

function createCommunityWelcomeDmDeliveryAdapter({ member } = {}) {
  assertMember(member);

  return Object.freeze({
    async send(payload) {
      return member.send(payload).catch(() => null);
    }
  });
}

module.exports = { createCommunityWelcomeDmDeliveryAdapter };
