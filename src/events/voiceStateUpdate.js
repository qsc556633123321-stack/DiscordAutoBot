const { Events } = require('discord.js');
const voiceStateUpdateGateway = require('../modules/events/voiceStateUpdateGateway');

module.exports = {
  name: Events.VoiceStateUpdate,
  execute: (oldState, newState) => voiceStateUpdateGateway.execute(oldState, newState)
};
