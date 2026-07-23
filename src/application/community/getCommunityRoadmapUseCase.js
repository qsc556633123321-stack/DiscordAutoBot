const { fromThrowable, ok } = require('../../core/result');
const { buildRoadmapViewModel } = require('../../domain/community/communityRoadmap');
const { assertCommunityRoadmapGateway } = require('./ports/communityRoadmapGateway');

function createGetCommunityRoadmapUseCase({ gateway, viewModelFactory = buildRoadmapViewModel } = {}) {
  assertCommunityRoadmapGateway(gateway);

  return {
    execute() {
      try {
        return ok({ roadmap: viewModelFactory(gateway.getCommunityRoadmap()) });
      } catch (error) {
        return fromThrowable(error, 'COMMUNITY_ROADMAP_QUERY_FAILED');
      }
    }
  };
}

module.exports = { createGetCommunityRoadmapUseCase };
