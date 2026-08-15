const path = require('node:path');

const DEFAULT_DATA_DIRECTORY = path.join(__dirname, '..', '..', '..', 'src', 'data');
const DEFAULT_ONBOARDING_FILE = path.join(DEFAULT_DATA_DIRECTORY, 'onboarding-flows.json');

function createFakeDefaultCommunityOnboardingJsonReaderFactory({ createJsonReader } = {}) {
  if (typeof createJsonReader !== 'function') {
    throw new TypeError('Fake default onboarding JsonReader factory requires createJsonReader');
  }

  return Object.freeze({
    createDefaultCommunityOnboardingJsonReader(overrides = {}) {
      return createJsonReader({
        ...overrides,
        dataDirectory: overrides.dataDirectory === undefined ? DEFAULT_DATA_DIRECTORY : overrides.dataDirectory,
        filePath: overrides.filePath === undefined ? DEFAULT_ONBOARDING_FILE : overrides.filePath
      });
    }
  });
}

module.exports = {
  DEFAULT_DATA_DIRECTORY,
  DEFAULT_ONBOARDING_FILE,
  createFakeDefaultCommunityOnboardingJsonReaderFactory
};
