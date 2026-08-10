const {
  createCommunityPublicationChannelTrackingReadRequest
} = require('../../../src/application/community/ports/CommunityPublicationChannelTrackingReadPort');
const {
  createCommunityPublicationChannelTrackingReadCompatibilityAdapter
} = require('../../../src/infrastructure/community/CommunityPublicationChannelTrackingReadCompatibilityAdapter');
const {
  mapLegacyWelcomeDeliveryRequest,
  buildCommunityWelcomeMessage
} = require('../../../src/application/community');

async function sendWelcomeWithChannelTrackingRead({ member, readOnboardingData, findChannelByName, guideChannelName }) {
  const onboardingStateReader = { readOnboardingState: readOnboardingData };
  const trackingReadPort = createCommunityPublicationChannelTrackingReadCompatibilityAdapter({ onboardingStateReader });
  const request = createCommunityPublicationChannelTrackingReadRequest({
    guildId: member.guild.id,
    publication: 'guide'
  });
  const { trackedChannelId: guideChannelId } = trackingReadPort.readTrackedChannel(request);
  const guideChannel = guideChannelId
    ? member.guild.channels.cache.get(guideChannelId) || await member.guild.channels.fetch(guideChannelId).catch(() => null)
    : findChannelByName(member.guild, guideChannelName);
  if (!guideChannel) return;
  const welcomeRequest = mapLegacyWelcomeDeliveryRequest({ guildId: member.guild.id, guideChannelId: guideChannel.id });
  const payload = buildCommunityWelcomeMessage(welcomeRequest, { guildName: member.guild.name });
  await member.send(payload).catch(() => null);
}

module.exports = { sendWelcomeWithChannelTrackingRead };
