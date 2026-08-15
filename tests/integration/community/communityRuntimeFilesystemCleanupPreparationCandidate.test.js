const assert = require('node:assert/strict');
const path = require('node:path');
const {
  DATA_DIRECTORY,
  FILE_PATH,
  createFakeDefaultCommunityOnboardingJsonReaderFactory
} = require('../../fakes/community/FakeDefaultCommunityOnboardingJsonReaderFactory');

const expectedDirectory = path.join(__dirname, '..', '..', '..', 'src', 'data');
const expectedFile = path.join(expectedDirectory, 'onboarding-flows.json');
assert.equal(DATA_DIRECTORY, expectedDirectory);
assert.equal(FILE_PATH, expectedFile);

let constructions = 0;
let reads = 0;
const received = [];
const factory = createFakeDefaultCommunityOnboardingJsonReaderFactory({
  createJsonReader(options) {
    constructions += 1;
    received.push(options);
    return {
      readRoot() {
        reads += 1;
        return { guild: {} };
      }
    };
  }
});

for (const flow of ['guide', 'roadmap', 'welcome']) {
  const reader = factory.createDefaultCommunityOnboardingJsonReader();
  assert.deepEqual(reader.readRoot(), { guild: {} }, `${flow} output`);
}
assert.equal(constructions, 3);
assert.equal(reads, 3);
assert.deepEqual(received, Array.from({ length: 3 }, () => ({ dataDirectory: expectedDirectory, filePath: expectedFile })));
console.log('Default onboarding JsonReader factory candidate preserves exact paths and one construction/read per closed flow.');
