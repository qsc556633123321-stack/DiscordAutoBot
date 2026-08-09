const RoadmapPublicationMessageLookupKind = Object.freeze({
  Available: 'Available',
  Unavailable: 'Unavailable'
});

function createRoadmapPublicationMessageLookupRequest(input = {}) {
  return Object.freeze({ messageId: input?.messageId });
}

function createRoadmapPublicationMessageAvailable({ messageId } = {}) {
  return Object.freeze({
    kind: RoadmapPublicationMessageLookupKind.Available,
    messageId
  });
}

function createRoadmapPublicationMessageUnavailable() {
  return Object.freeze({ kind: RoadmapPublicationMessageLookupKind.Unavailable });
}

module.exports = {
  RoadmapPublicationMessageLookupKind,
  createRoadmapPublicationMessageLookupRequest,
  createRoadmapPublicationMessageAvailable,
  createRoadmapPublicationMessageUnavailable
};
