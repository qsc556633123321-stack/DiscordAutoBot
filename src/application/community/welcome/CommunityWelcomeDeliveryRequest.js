function createCommunityWelcomeDeliveryRequest(input = {}) {
  const source = input && typeof input === 'object' && !Array.isArray(input) ? input : {};
  return Object.freeze({
    guildId: source.guildId,
    guideChannelId: source.guideChannelId
  });
}

module.exports = { createCommunityWelcomeDeliveryRequest };
