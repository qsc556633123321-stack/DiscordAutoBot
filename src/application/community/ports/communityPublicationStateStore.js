function assertCommunityPublicationStateStore(store) {
  if (!store || typeof store.load !== 'function' || typeof store.applyPatch !== 'function') {
    throw new Error('communityPublicationStateStore requires load and applyPatch methods');
  }
}

module.exports = { assertCommunityPublicationStateStore };
