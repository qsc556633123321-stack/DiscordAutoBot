function createChannel(id, name, isTextBased = true) {
  return {
    id,
    name,
    isTextBased: () => isTextBased,
    toString: () => `<#${id}>`
  };
}

const standardChannels = [
  createChannel('1', '一般聊天'),
  createChannel('2', '深夜聊天'),
  createChannel('3', 'TFT-找隊友'),
  createChannel('4', '目前語音房'),
  createChannel('5', 'AI工具'),
  createChannel('6', '作品展示'),
  createChannel('7', '一般聊天'),
  createChannel('8', '語音頻道', false)
];

function toFacts(channels = standardChannels) {
  return channels.map((channel) => ({
    id: channel.id,
    name: channel.name,
    mention: `${channel}`,
    isTextBased: Boolean(channel.isTextBased?.())
  }));
}

function createFakeGuild(channels = standardChannels) {
  return {
    id: 'guild-1',
    name: 'Test Guild',
    channels: { cache: new Map(channels.map((channel) => [channel.id, channel])) }
  };
}

function createFakeChannelReader({ channels = toFacts(), error } = {}) {
  const calls = [];
  return {
    calls,
    async listTextChannels(guildId) {
      calls.push(guildId);
      if (error) throw error;
      return channels;
    }
  };
}

function createFakeTextGenerator({ value, error } = {}) {
  const calls = [];
  return {
    calls,
    async generate(kind, context, fallback) {
      calls.push({ kind, context, fallback });
      if (error) throw error;
      return value || fallback;
    }
  };
}

module.exports = {
  createChannel,
  createFakeChannelReader,
  createFakeGuild,
  createFakeTextGenerator,
  standardChannels,
  toFacts
};
