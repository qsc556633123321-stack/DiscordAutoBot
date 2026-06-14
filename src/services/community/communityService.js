const { fromThrowable, ok } = require('../../core/result');
const channelRepository = require('../../infrastructure/discord/discordChannelRepository');
const channelPanels = require('../../systems/channelPanels');

const legacyCommands = {
  analyzeServer: require('../../legacy/commands/analyze_server'),
  aiReorganizeServer: require('../../legacy/commands/ai_reorganize_server'),
  autoOrganize: require('../../legacy/commands/auto_organize'),
  deepCleanup: require('../../legacy/commands/deep_cleanup'),
  planCleanup: require('../../legacy/commands/plan_cleanup'),
  rebuildServer: require('../../legacy/commands/rebuild_server')
};
const setupServerLegacy = require('../../legacy/commands/setupServerLegacy');
const setupTicketLegacy = require('../../legacy/commands/setupTicketLegacy');

async function wrap(code, task) {
  try {
    return ok(await task());
  } catch (error) {
    return fromThrowable(error, code);
  }
}

module.exports = {
  executeLegacy: (name, interaction) => wrap('LEGACY_COMMUNITY_COMMAND_FAILED', () => legacyCommands[name].execute(interaction)),
  moveChannel: (channel, categoryId, actorTag) => channelRepository.move(channel, categoryId, {
    lockPermissions: false,
    reason: `Moved by ${actorTag}`
  }),
  renameChannel: (channel, name, actorTag) => channelRepository.rename(channel, name, `Renamed by ${actorTag}`),
  setupPanels: (options) => wrap('CHANNEL_PANEL_SETUP_FAILED', () => channelPanels.setupChannelPanels(options)),
  setupServer: (interaction) => wrap('SETUP_SERVER_FAILED', () => setupServerLegacy.execute(interaction)),
  setupTicket: (interaction) => wrap('SETUP_TICKET_FAILED', () => setupTicketLegacy.execute(interaction))
};
