const { Events } = require('discord.js');
const { cleanupMissingTempVoices } = require('../systems/tempVoice');
const { repairCreateEntryRegistryForClient } = require('../systems/gameChannels');
const { restoreVoiceHubs } = require('../services/voice/voiceHubService');
const { restoreLfgCards } = require('../systems/lfgSystem');
const { initVoiceActivitySystem } = require('../systems/voiceActivitySystem');

module.exports = {
  name: Events.ClientReady,
  async execute(client) {
    console.log(`Discord Server Architect Bot ready: ${client.user.tag}`);
    try {
      await repairCreateEntryRegistryForClient(client);
      await cleanupMissingTempVoices(client);
      await restoreVoiceHubs(client);
      await restoreLfgCards(client);
      initVoiceActivitySystem(client);
    } catch (error) {
      console.error('Startup recovery failed:', error);
    }
  }
};
