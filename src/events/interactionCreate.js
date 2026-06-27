const { Events } = require('discord.js');
const interactionGateway = require('../modules/interactions/interactionGateway');

module.exports = {
  name: Events.InteractionCreate,
  execute: (interaction) => interactionGateway.handle(interaction)
};
