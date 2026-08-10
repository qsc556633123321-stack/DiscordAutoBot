const CommunityPublicationTrackingPublications = Object.freeze(['guide', 'roadmap']);
const { fromLegacyPublicationRecord } = require('../communityPublicationStateMapper');

function assertSupportedCommunityPublication(publication) {
  if (!CommunityPublicationTrackingPublications.includes(publication)) {
    throw new Error(`Unsupported publication: ${publication}`);
  }
}

function createCommunityPublicationTrackingReadRequest(input = {}) {
  const publication = input.publication;
  assertSupportedCommunityPublication(publication);

  return Object.freeze({
    guildId: input.guildId,
    publication
  });
}

function createCommunityPublicationTrackingReadResult({ trackedMessageId } = {}) {
  return Object.freeze({ trackedMessageId });
}

function assertCommunityPublicationTrackingReadPort(port) {
  if (!port || typeof port.readTrackedMessage !== 'function') {
    throw new Error('CommunityPublicationTrackingReadPort requires a readTrackedMessage method');
  }
}

module.exports = {
  CommunityPublicationTrackingPublications,
  assertSupportedCommunityPublication,
  createCommunityPublicationTrackingReadRequest,
  createCommunityPublicationTrackingReadResult,
  assertCommunityPublicationTrackingReadPort,
  fromLegacyPublicationRecord
};
