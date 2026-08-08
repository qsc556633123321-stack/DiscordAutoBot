function assertCommunityPublicationRecordRepository(repository) {
  if (!repository || typeof repository.mergeRecord !== 'function') {
    throw new Error('communityPublicationRecordRepository requires a mergeRecord method');
  }
}

module.exports = { assertCommunityPublicationRecordRepository };
