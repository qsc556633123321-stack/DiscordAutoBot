const { createGetCommunityRoadmapUseCase } = require('../application/community/getCommunityRoadmapUseCase');
const communityRoadmapGateway = require('../infrastructure/community/communityRoadmapGateway');

function createCommunityRoadmapFeature({ gateway = communityRoadmapGateway, viewModelFactory } = {}) {
  return {
    getCommunityRoadmap: createGetCommunityRoadmapUseCase({ gateway, viewModelFactory })
  };
}

module.exports = { createCommunityRoadmapFeature };
