const { createPersistCommunityPublicationRecordUseCase } = require('../application/community/persistCommunityPublicationRecordUseCase');
const { createCommunityPublicationStateFilesystemAdapter } = require('../infrastructure/community/communityPublicationStateFilesystemAdapter');

function createCommunityPublicationStateFeature({ repository, ...adapterDependencies } = {}) {
  const publicationRepository = repository || createCommunityPublicationStateFilesystemAdapter(adapterDependencies);

  return {
    persistCommunityPublicationRecord: createPersistCommunityPublicationRecordUseCase({
      repository: publicationRepository,
      now: adapterDependencies.now
    })
  };
}

module.exports = { createCommunityPublicationStateFeature };
