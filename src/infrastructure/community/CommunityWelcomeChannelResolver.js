function assertGuild(guild) {
  if (!guild) throw new TypeError('CommunityWelcomeChannelResolver requires guild');
  if (typeof guild.channels?.cache?.get !== 'function') {
    throw new TypeError('CommunityWelcomeChannelResolver requires guild.channels.cache.get');
  }
  if (typeof guild.channels?.fetch !== 'function') {
    throw new TypeError('CommunityWelcomeChannelResolver requires guild.channels.fetch');
  }
}

function assertFindChannelByName(findChannelByName) {
  if (typeof findChannelByName !== 'function') {
    throw new TypeError('CommunityWelcomeChannelResolver requires findChannelByName');
  }
}

function createCommunityWelcomeChannelResolver({ guild, findChannelByName } = {}) {
  assertGuild(guild);
  assertFindChannelByName(findChannelByName);

  return Object.freeze({
    async resolve({ trackedChannelId, fallbackChannelName } = {}) {
      if (trackedChannelId) {
        return guild.channels.cache.get(trackedChannelId)
          || await guild.channels.fetch(trackedChannelId).catch(() => null);
      }
      return findChannelByName(guild, fallbackChannelName);
    }
  });
}

module.exports = { createCommunityWelcomeChannelResolver };
