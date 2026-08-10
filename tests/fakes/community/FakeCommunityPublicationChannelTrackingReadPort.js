const CommunityPublicationChannelTrackingPublications = Object.freeze(['guide']);

function assertSupportedCommunityPublicationChannel(publication) {
  if (!CommunityPublicationChannelTrackingPublications.includes(publication)) {
    throw new Error(`Unsupported publication: ${publication}`);
  }
}

function createCommunityPublicationChannelTrackingReadRequest(input = {}) {
  const publication = input.publication;
  assertSupportedCommunityPublicationChannel(publication);
  return Object.freeze({ guildId: input.guildId, publication });
}

function createCommunityPublicationChannelTrackingReadResult({ trackedChannelId } = {}) {
  return Object.freeze({ trackedChannelId });
}

module.exports = {
  CommunityPublicationChannelTrackingPublications,
  assertSupportedCommunityPublicationChannel,
  createCommunityPublicationChannelTrackingReadRequest,
  createCommunityPublicationChannelTrackingReadResult
};
