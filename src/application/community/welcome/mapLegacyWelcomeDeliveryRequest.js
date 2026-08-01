const { createCommunityWelcomeDeliveryRequest } = require('./CommunityWelcomeDeliveryRequest');

function mapLegacyWelcomeDeliveryRequest(input = {}) {
  const source = input && typeof input === 'object' && !Array.isArray(input) ? input : {};
  return createCommunityWelcomeDeliveryRequest({
    guildId: source.guildId,
    guideChannelId: source.guideChannelId
  });
}

module.exports = { mapLegacyWelcomeDeliveryRequest };
