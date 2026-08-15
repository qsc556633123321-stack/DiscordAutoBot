const path = require('node:path');
const { createCommunityOnboardingJsonReader } = require('./CommunityOnboardingJsonReader');

const DEFAULT_DATA_DIRECTORY = path.join(__dirname, '..', '..', 'data');
const DEFAULT_ONBOARDING_FILE = path.join(DEFAULT_DATA_DIRECTORY, 'onboarding-flows.json');

function createDefaultCommunityOnboardingJsonReader(overrides = {}) {
  return createCommunityOnboardingJsonReader({
    ...overrides,
    dataDirectory: overrides.dataDirectory === undefined ? DEFAULT_DATA_DIRECTORY : overrides.dataDirectory,
    filePath: overrides.filePath === undefined ? DEFAULT_ONBOARDING_FILE : overrides.filePath
  });
}

module.exports = {
  DEFAULT_DATA_DIRECTORY,
  DEFAULT_ONBOARDING_FILE,
  createDefaultCommunityOnboardingJsonReader
};
