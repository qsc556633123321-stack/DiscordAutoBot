function createFakeCommunityWelcomeDmDeliveryAdapter({ member } = {}) {
  if (!member) throw new Error('Member is required.');

  return {
    async send(payload) {
      return member.send(payload).catch(() => null);
    }
  };
}

module.exports = { createFakeCommunityWelcomeDmDeliveryAdapter };
