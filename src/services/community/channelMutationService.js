const channelRepository = require('../../infrastructure/discord/discordChannelRepository');

module.exports = {
  move: (channel, categoryId, actorTag) => channelRepository.move(channel, categoryId, {
    lockPermissions: false,
    reason: `Moved by ${actorTag}`
  }),
  rename: (channel, name, actorTag) => channelRepository.rename(channel, name, `Renamed by ${actorTag}`)
};
