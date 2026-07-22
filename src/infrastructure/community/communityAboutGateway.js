function createCommunityAboutGateway({ factsReader = ({ guildName } = {}) => ({ guildName }) } = {}) {
  return {
    getCommunityAboutFacts({ guildName } = {}) {
      return factsReader({ guildName });
    }
  };
}

const gateway = createCommunityAboutGateway();

module.exports = { ...gateway, createCommunityAboutGateway };
