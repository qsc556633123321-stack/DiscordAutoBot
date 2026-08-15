const assert = require('node:assert/strict');
const path = require('node:path');
const {
  DEFAULT_DATA_DIRECTORY,
  DEFAULT_ONBOARDING_FILE,
  createDefaultCommunityOnboardingJsonReader
} = require('../../../src/infrastructure/community/CommunityOnboardingJsonReaderFactory');

assert.equal(DEFAULT_DATA_DIRECTORY, path.join(__dirname, '..', '..', '..', 'src', 'data'));
assert.equal(DEFAULT_ONBOARDING_FILE, path.join(DEFAULT_DATA_DIRECTORY, 'onboarding-flows.json'));

const calls = [];
const filesystem = {
  existsSync(target) { calls.push(['exists', target]); return true; },
  mkdirSync() { calls.push(['mkdir']); },
  writeFileSync() { calls.push(['write']); },
  readFileSync(target) { calls.push(['read', target]); return '{"guild":{}}'; }
};
const reader = createDefaultCommunityOnboardingJsonReader({
  filesystem,
  pathModule: { basename: () => 'onboarding-flows.json' },
  logger: { error() {} }
});
assert.deepEqual(calls, [], 'factory construction must not perform filesystem I/O');
assert.deepEqual(reader.readRoot({}), { guild: {} });
assert.deepEqual(calls.map(([name]) => name), ['exists', 'exists', 'read']);

const overrideCalls = [];
createDefaultCommunityOnboardingJsonReader({
  dataDirectory: '/custom/data',
  filePath: '/custom/state.json',
  filesystem: {
    existsSync(target) { overrideCalls.push(target); return true; },
    mkdirSync() {}, writeFileSync() {}, readFileSync() { return '{}'; }
  },
  pathModule: { basename: () => 'state.json' },
  logger: { error() {} }
}).readRoot({});
assert.deepEqual(overrideCalls, ['/custom/data', '/custom/state.json']);

console.log('Default Community onboarding JsonReader factory preserves exact defaults, overrides, and deferred I/O.');
