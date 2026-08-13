const { createFakeCommunityOnboardingStateReaderJsonDependency } = require('./FakeCommunityOnboardingStateReaderJsonDependency');

function createFakeCommunityStateReaderJsonRuntimeConstruction({ createOnboardingJsonReader } = {}) {
  function createReader() {
    const onboardingJsonReader = createOnboardingJsonReader();
    return createFakeCommunityOnboardingStateReaderJsonDependency({ onboardingJsonReader });
  }

  return Object.freeze({
    createGuideReader: createReader,
    createRoadmapReader: createReader,
    createWelcomeReader: createReader
  });
}

module.exports = { createFakeCommunityStateReaderJsonRuntimeConstruction };
