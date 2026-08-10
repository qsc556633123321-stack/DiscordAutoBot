function createFakeCommunityOnboardingStateReaderV2({ filePath, readJson } = {}) {
  if (typeof readJson !== 'function') {
    throw new TypeError('FakeCommunityOnboardingStateReaderV2 requires readJson');
  }

  return Object.freeze({
    readOnboardingState() {
      return readJson(filePath, {});
    }
  });
}

module.exports = { createFakeCommunityOnboardingStateReaderV2 };
