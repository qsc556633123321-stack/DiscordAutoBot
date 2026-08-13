function assertOnboardingJsonReader(onboardingJsonReader) {
  if (typeof onboardingJsonReader?.readRoot !== 'function') {
    throw new TypeError('CommunityOnboardingStateReader requires onboardingJsonReader.readRoot');
  }
}

function createFakeCommunityOnboardingStateReaderJsonDependency({ onboardingJsonReader } = {}) {
  assertOnboardingJsonReader(onboardingJsonReader);
  return Object.freeze({
    readOnboardingState() {
      return onboardingJsonReader.readRoot({});
    }
  });
}

module.exports = { createFakeCommunityOnboardingStateReaderJsonDependency };
