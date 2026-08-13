function createFakeCommunityWelcomeChannelResolver({ guild, findChannelByName } = {}) {
  if (!guild) throw new Error('Guild is required.');
  if (typeof findChannelByName !== 'function') throw new Error('findChannelByName is required.');

  return {
    async resolve({ trackedChannelId, fallbackChannelName }) {
      if (trackedChannelId) {
        return guild.channels.cache.get(trackedChannelId)
          || await guild.channels.fetch(trackedChannelId).catch(() => null);
      }
      return findChannelByName(guild, fallbackChannelName);
    }
  };
}

module.exports = { createFakeCommunityWelcomeChannelResolver };
