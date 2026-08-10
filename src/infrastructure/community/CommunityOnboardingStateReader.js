function assertReadJson(readJson) {
  if (typeof readJson !== 'function') {
    throw new TypeError('CommunityOnboardingStateReader requires readJson');
  }
}

function createCommunityOnboardingStateReader({ filePath, readJson } = {}) {
  assertReadJson(readJson);

  return Object.freeze({
    readOnboardingState() {
      return readJson(filePath, {});
    }
  });
}

module.exports = { createCommunityOnboardingStateReader };
