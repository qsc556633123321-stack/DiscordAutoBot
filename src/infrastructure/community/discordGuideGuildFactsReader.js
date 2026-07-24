function createDiscordGuideGuildFactsReader({ guildResolver } = {}) {
  if (typeof guildResolver !== 'function') throw new TypeError('guildResolver is required');

  return {
    async readGuideGuildFacts(guildId) {
      const guild = await guildResolver(guildId);
      if (!guild) throw new Error(`Guild not found: ${guildId}`);
      return {
        id: guild.id,
        name: guild.name,
        channels: [...guild.channels.cache.values()].map((channel) => ({ id: channel.id, name: channel.name }))
      };
    }
  };
}

module.exports = { createDiscordGuideGuildFactsReader };
