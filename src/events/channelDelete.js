const { Events } = require('discord.js');
const { handleTempVoiceChannelDelete } = require('../systems/tempVoice');

module.exports = {
  name: Events.ChannelDelete,
  async execute(channel) {
    try {
      await handleTempVoiceChannelDelete(channel);
    } catch (error) {
      console.error('Temp Voice channel delete cleanup failed:', error);
    }
  }
};
