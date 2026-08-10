const {
  createCommunityOnboardingStateReader
} = require('../../../src/infrastructure/community/CommunityOnboardingStateReader');
const {
  createFakeCommunityPublicationTrackingReadReaderAdapter
} = require('./FakeCommunityPublicationTrackingReadReaderAdapter');
const {
  createFakeCommunityPublicationChannelTrackingReadReaderAdapter
} = require('./FakeCommunityPublicationChannelTrackingReadReaderAdapter');

function createFakeCommunityTrackingReaderRuntimeConstruction({ filePath, readJson } = {}) {
  function createMessageAdapter() {
    const onboardingStateReader = createCommunityOnboardingStateReader({ filePath, readJson });
    return createFakeCommunityPublicationTrackingReadReaderAdapter({ onboardingStateReader });
  }

  function createChannelAdapter() {
    const onboardingStateReader = createCommunityOnboardingStateReader({ filePath, readJson });
    return createFakeCommunityPublicationChannelTrackingReadReaderAdapter({ onboardingStateReader });
  }

  return { createMessageAdapter, createChannelAdapter };
}

module.exports = { createFakeCommunityTrackingReaderRuntimeConstruction };
