function assertCommunityAboutGateway(gateway) {
  if (!gateway || typeof gateway.getCommunityAboutFacts !== 'function') {
    throw new Error('Community about gateway is required.');
  }
  return gateway;
}

module.exports = { assertCommunityAboutGateway };
