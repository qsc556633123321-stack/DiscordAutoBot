function assertCommunitySnapshotRepositoryPort(port) {
  if (typeof port?.saveSnapshot !== 'function' || typeof port?.loadLatestSnapshot !== 'function') throw new TypeError('CommunitySnapshotRepositoryPort requires saveSnapshot and loadLatestSnapshot');
  return port;
}

module.exports = { assertCommunitySnapshotRepositoryPort };
