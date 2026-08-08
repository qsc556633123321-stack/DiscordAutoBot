function createFakeGuideDiscordResources({ guild, channel, message, failures = {} } = {}) {
  const calls = [];
  const fail = (name) => {
    if (failures[name]) throw failures[name];
  };
  return {
    calls,
    resolveGuild(guildId) {
      calls.push({ method: 'resolveGuild', guildId });
      fail('resolveGuild');
      return guild || null;
    },
    resolveChannel({ guildId, channelId }) {
      calls.push({ method: 'resolveChannel', guildId, channelId });
      fail('resolveChannel');
      return channel || null;
    },
    fetchMessage({ guildId, channelId, messageId }) {
      calls.push({ method: 'fetchMessage', guildId, channelId, messageId });
      fail('fetchMessage');
      return message || null;
    },
    editMessage({ messageId, payload }) {
      calls.push({ method: 'editMessage', messageId, payload });
      fail('editMessage');
      return message || null;
    },
    sendMessage({ channelId, payload }) {
      calls.push({ method: 'sendMessage', channelId, payload });
      fail('sendMessage');
      return message || null;
    }
  };
}

module.exports = { createFakeGuideDiscordResources };
