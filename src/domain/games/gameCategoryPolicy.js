const architecture = require('../community/communityArchitectureV3');
const { findGameIdentity } = require('./gameIdentityService');

function getPlacement(inputName) {
  const identity = findGameIdentity(inputName);
  return identity.tier === architecture.gamePlacementRules.popularTier
    ? architecture.gamePlacementRules.popularAnchorKey
    : architecture.gamePlacementRules.dynamicAnchorKey;
}

function getChildChannelSpecs() {
  return architecture.gameChannels.map((channel) => ({ ...channel }));
}

module.exports = { getChildChannelSpecs, getPlacement };
