const path = require('node:path');

const DATA_DIRECTORY = path.join(__dirname, '..', '..', '..', 'src', 'data');
const FILE_PATH = path.join(DATA_DIRECTORY, 'onboarding-flows.json');

function createFakeDefaultCommunityOnboardingJsonReaderFactory({ createJsonReader } = {}) {
  if (typeof createJsonReader !== 'function') {
    throw new TypeError('Fake default onboarding JsonReader factory requires createJsonReader');
  }

  return Object.freeze({
    createDefaultCommunityOnboardingJsonReader() {
      return createJsonReader({ dataDirectory: DATA_DIRECTORY, filePath: FILE_PATH });
    }
  });
}

module.exports = {
  DATA_DIRECTORY,
  FILE_PATH,
  createFakeDefaultCommunityOnboardingJsonReaderFactory
};
