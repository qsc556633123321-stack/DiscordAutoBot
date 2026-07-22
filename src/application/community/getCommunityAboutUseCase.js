const { fromThrowable, ok } = require('../../core/result');
const { createCommunityAboutModel } = require('../../domain/community/communityAbout');
const { assertCommunityAboutGateway } = require('./ports/communityAboutGateway');

function createGetCommunityAboutUseCase({ gateway, modelFactory = createCommunityAboutModel } = {}) {
  assertCommunityAboutGateway(gateway);

  return {
    execute({ guildName } = {}) {
      try {
        return ok({ about: modelFactory(gateway.getCommunityAboutFacts({ guildName })) });
      } catch (error) {
        return fromThrowable(error, 'COMMUNITY_ABOUT_QUERY_FAILED');
      }
    }
  };
}

module.exports = { createGetCommunityAboutUseCase };
