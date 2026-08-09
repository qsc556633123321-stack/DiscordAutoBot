function createFakeCommunityRoadmapLookupPort({ lookup }) {
  return { async lookupTrackedMessage({ messageId }) {
    const result = await lookup(messageId);
    return result?.kind === 'Available' ? { kind: 'Available', messageId: result.messageId } : { kind: 'Unavailable' };
  } };
}
module.exports = { createFakeCommunityRoadmapLookupPort };
