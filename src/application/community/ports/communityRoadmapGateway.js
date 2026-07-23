function assertCommunityRoadmapGateway(gateway) {
  if (!gateway || typeof gateway.getCommunityRoadmap !== 'function') {
    throw new Error('Community roadmap gateway is required.');
  }
}

module.exports = { assertCommunityRoadmapGateway };
