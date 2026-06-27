const { fromThrowable, ok } = require('../../core/result');
const channelRepository = require('../../infrastructure/discord/discordChannelRepository');
const channelPanels = require('../../systems/channelPanels');

async function wrap(code, task) {
  try {
    return ok(await task());
  } catch (error) {
    return fromThrowable(error, code);
  }
}

module.exports = {
  moveChannel: (channel, categoryId, actorTag) => channelRepository.move(channel, categoryId, {
    lockPermissions: false,
    reason: `Moved by ${actorTag}`
  }),
  renameChannel: (channel, name, actorTag) => channelRepository.rename(channel, name, `Renamed by ${actorTag}`),
  setupPanels: (options) => wrap('CHANNEL_PANEL_SETUP_FAILED', () => channelPanels.setupChannelPanels(options))
};
