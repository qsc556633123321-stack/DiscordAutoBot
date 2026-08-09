// Test-only mirror of the legacy mutation/persistence boundary. It deliberately
// owns no port or adapter and is used only to document a future migration shape.
function createFakeCommunityRoadmapMutationBoundary({ saveOnboarding } = {}) {
  return {
    async publish({ guildId, channel, message, payload }) {
      let publishedMessage = message;
      if (publishedMessage) await publishedMessage.edit(payload);
      else publishedMessage = await channel.send(payload);
      saveOnboarding(guildId, {
        roadmapChannelId: channel.id,
        roadmapMessageId: publishedMessage.id
      });
      return { channel, message: publishedMessage };
    }
  };
}

module.exports = { createFakeCommunityRoadmapMutationBoundary };
