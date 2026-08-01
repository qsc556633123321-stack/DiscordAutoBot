const { fromLegacyPublicationRecord, toLegacyPublicationPatch } = require('./communityPublicationStateMapper');
const { createCommunityWelcomeDeliveryRequest } = require('./welcome/CommunityWelcomeDeliveryRequest');
const { CommunityWelcomeDeliveryFailureReason } = require('./welcome/CommunityWelcomeDeliveryFailureReason');
const { CommunityWelcomeDeliveryStatus, createCommunityWelcomeDeliveryResult } = require('./welcome/CommunityWelcomeDeliveryResult');
const { buildCommunityWelcomeMessage } = require('./welcome/buildCommunityWelcomeMessage');
const { mapLegacyWelcomeDeliveryRequest } = require('./welcome/mapLegacyWelcomeDeliveryRequest');

module.exports = {
  fromLegacyPublicationRecord,
  toLegacyPublicationPatch,
  createCommunityWelcomeDeliveryRequest,
  CommunityWelcomeDeliveryFailureReason,
  CommunityWelcomeDeliveryStatus,
  createCommunityWelcomeDeliveryResult,
  buildCommunityWelcomeMessage,
  mapLegacyWelcomeDeliveryRequest,
};
