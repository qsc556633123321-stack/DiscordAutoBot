function createFakeGuideMessageLookupDiscordResources({ channel, channelError, message, messageError } = {}) {
  const calls = [];
  return {
    calls,
    resolveChannel(input) {
      calls.push({ method: 'resolveChannel', input });
      if (channelError) throw channelError;
      return channel;
    },
    fetchMessage(messageId) {
      calls.push({ method: 'fetchMessage', messageId });
      if (messageError) throw messageError;
      return message;
    }
  };
}

module.exports = { createFakeGuideMessageLookupDiscordResources };
