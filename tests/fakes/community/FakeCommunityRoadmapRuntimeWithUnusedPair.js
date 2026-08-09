function createFakeCommunityRoadmapRuntimeWithUnusedPair({
  getOrCreateRoadmapChannel,
  readOnboardingData,
  fromLegacyPublicationRecord,
  buildRoadmapEmbed,
  saveOnboarding,
  createFeature
}) {
  const feature = createFeature();

  return {
    async setupRoadmapPanel(guild) {
      const channel = await getOrCreateRoadmapChannel(guild);
      // This candidate intentionally creates, but does not consume, the Pair.
      feature.createAdapterPair({ ensuredChannel: channel });
      const data = readOnboardingData()[guild.id] || {};
      const publicationState = fromLegacyPublicationRecord(guild.id, data);
      const roadmapMessageId = publicationState.roadmap.messageId || data.roadmapMessageId;
      const payload = { embeds: [buildRoadmapEmbed()] };
      let message = roadmapMessageId
        ? await channel.messages.fetch(roadmapMessageId).catch(() => null)
        : null;
      if (message) await message.edit(payload);
      else message = await channel.send(payload);
      saveOnboarding(guild.id, {
        roadmapChannelId: channel.id,
        roadmapMessageId: message.id
      });
      return { channel, message };
    }
  };
}

module.exports = { createFakeCommunityRoadmapRuntimeWithUnusedPair };
