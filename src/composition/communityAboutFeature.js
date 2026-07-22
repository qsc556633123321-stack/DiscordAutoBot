const { createGetCommunityAboutUseCase } = require('../application/community/getCommunityAboutUseCase');
const communityAboutGateway = require('../infrastructure/community/communityAboutGateway');

function createCommunityAboutFeature({ gateway = communityAboutGateway, modelFactory, logger } = {}) {
  return {
    getCommunityAbout: createGetCommunityAboutUseCase({ gateway, modelFactory })
  };
}

module.exports = { createCommunityAboutFeature };
