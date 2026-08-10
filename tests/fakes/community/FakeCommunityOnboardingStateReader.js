function createFakeCommunityOnboardingStateReader({ readRoot } = {}) {
  if (typeof readRoot !== 'function') {
    throw new TypeError('FakeCommunityOnboardingStateReader requires readRoot');
  }

  return Object.freeze({
    readOnboardingState() {
      return readRoot();
    }
  });
}

module.exports = { createFakeCommunityOnboardingStateReader };
