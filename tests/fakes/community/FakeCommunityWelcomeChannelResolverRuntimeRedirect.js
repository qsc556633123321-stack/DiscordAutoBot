const {
  createCommunityPublicationChannelTrackingReadRequest
} = require('../../../src/application/community/ports/CommunityPublicationChannelTrackingReadPort');
const {
  createCommunityPublicationChannelTrackingReadCompatibilityAdapter
} = require('../../../src/infrastructure/community/CommunityPublicationChannelTrackingReadCompatibilityAdapter');
const {
  createCommunityWelcomeChannelResolver
} = require('../../../src/infrastructure/community/CommunityWelcomeChannelResolver');
const {
  mapLegacyWelcomeDeliveryRequest,
  buildCommunityWelcomeMessage
} = require('../../../src/application/community');

async function sendWelcomeWithChannelResolver({ member, onboardingStateReader, findChannelByName, guideChannelName }) {
  const trackingReadPort = createCommunityPublicationChannelTrackingReadCompatibilityAdapter({ onboardingStateReader });
  const trackingReadRequest = createCommunityPublicationChannelTrackingReadRequest({
    guildId: member.guild.id,
    publication: 'guide'
  });
  const { trackedChannelId: guideChannelId } = trackingReadPort.readTrackedChannel(trackingReadRequest);
  const channelResolver = createCommunityWelcomeChannelResolver({
    guild: member.guild,
    findChannelByName
  });
  const guideChannel = await channelResolver.resolve({
    trackedChannelId: guideChannelId,
    fallbackChannelName: guideChannelName
  });
  if (!guideChannel) return;
  const request = mapLegacyWelcomeDeliveryRequest({ guildId: member.guild.id, guideChannelId: guideChannel.id });
  const payload = buildCommunityWelcomeMessage(request, { guildName: member.guild.name });
  await member.send(payload).catch(() => null);
}

module.exports = { sendWelcomeWithChannelResolver };
