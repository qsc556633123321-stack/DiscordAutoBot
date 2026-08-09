function createFakeCommunityRoadmapLookupAdapter({ session }) {
  return { lookupTrackedMessage({ messageId }) { return session.lookupTrackedMessage(messageId); } };
}
module.exports = { createFakeCommunityRoadmapLookupAdapter };
