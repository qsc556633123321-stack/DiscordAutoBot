function createDiscordGuildChannelReader({ guildResolver } = {}) {
  if (typeof guildResolver !== 'function') throw new Error('Guild resolver is required.');

  return {
    listTextChannels(guildId) {
      const guild = guildResolver(guildId);
      if (!guild) throw new Error('Guild is required.');

      return [...guild.channels.cache.values()].map((channel) => ({
        id: channel.id,
        name: channel.name,
        mention: `${channel}`,
        isTextBased: Boolean(channel.isTextBased?.())
      }));
    }
  };
}

module.exports = { createDiscordGuildChannelReader };
