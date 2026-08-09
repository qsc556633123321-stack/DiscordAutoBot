function createFakeCommunityRoadmapLookupResourceSession({ channel }) {
  let retainedMessage = null;
  return {
    getChannel() { return channel; },
    retain(message) { retainedMessage = message || null; },
    getRetainedMessage() { return retainedMessage; }
  };
}

module.exports = { createFakeCommunityRoadmapLookupResourceSession };
