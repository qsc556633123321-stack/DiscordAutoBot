const assert = require('node:assert/strict');
const { createCommunityOnboardingJsonReader } = require('../../../src/infrastructure/community/CommunityOnboardingJsonReader');
const { createCommunityOnboardingStateReader } = require('../../../src/infrastructure/community/CommunityOnboardingStateReader');
const { createCommunityPublicationTrackingReadCompatibilityAdapter } = require('../../../src/infrastructure/community/CommunityPublicationTrackingReadCompatibilityAdapter');
const { createCommunityPublicationTrackingReadRequest } = require('../../../src/application/community/ports/CommunityPublicationTrackingReadPort');
const { createCommunityPublicationChannelTrackingReadCompatibilityAdapter } = require('../../../src/infrastructure/community/CommunityPublicationChannelTrackingReadCompatibilityAdapter');
const { createCommunityPublicationChannelTrackingReadRequest } = require('../../../src/application/community/ports/CommunityPublicationChannelTrackingReadPort');
const {
  DEFAULT_DATA_DIRECTORY,
  DEFAULT_ONBOARDING_FILE,
  createFakeDefaultCommunityOnboardingJsonReaderFactory
} = require('../../fakes/community/FakeDefaultCommunityOnboardingJsonReaderFactoryV2');

function createFilesystem({ exists = {}, content = '{}', readError, mkdirError, writeError } = {}) {
  exists = { ...exists };
  const calls = [];
  return { calls,
    existsSync(target) { calls.push(['exists', target]); return Boolean(exists[target]); },
    mkdirSync(target, options) { calls.push(['mkdir', target, options]); if (mkdirError) throw mkdirError; exists[target] = true; },
    writeFileSync(target, value, encoding) { calls.push(['write', target, value, encoding]); if (writeError) throw writeError; exists[target] = true; content = value; },
    readFileSync(target, encoding) { calls.push(['read', target, encoding]); if (readError) throw readError; return content; }
  };
}

function createExplicit(filesystem, logs) {
  return createCommunityOnboardingJsonReader({
    dataDirectory: DEFAULT_DATA_DIRECTORY,
    filePath: DEFAULT_ONBOARDING_FILE,
    filesystem,
    pathModule: { basename: () => 'onboarding-flows.json' },
    logger: { error: (...args) => logs.push(args) }
  });
}

function createDefault(filesystem, logs) {
  const factory = createFakeDefaultCommunityOnboardingJsonReaderFactory({ createJsonReader: createCommunityOnboardingJsonReader });
  return factory.createDefaultCommunityOnboardingJsonReader({
    filesystem,
    pathModule: { basename: () => 'onboarding-flows.json' },
    logger: { error: (...args) => logs.push(args) }
  });
}

{
  const filesystem = createFilesystem();
  createDefault(filesystem, []);
  assert.deepEqual(filesystem.calls, [], 'default construction has no filesystem side effects before readRoot');
}

for (const [name, options] of [
  ['valid', { content: '{"guild":{"guideMessageId":"guide","roadmapMessageId":"roadmap","guideChannelId":"channel"}}' }],
  ['empty', { content: '' }], ['missing directory', { exists: {} }],
  ['missing file', { exists: { [DEFAULT_DATA_DIRECTORY]: true } }], ['malformed', { content: '{bad' }],
  ['null', { content: 'null' }], ['array', { content: '[]' }], ['string', { content: '"text"' }],
  ['number', { content: '1' }], ['boolean', { content: 'true' }], ['read error', { readError: new Error('read') }]
]) {
  const explicitLogs = []; const defaultLogs = [];
  const explicitFilesystem = createFilesystem({ exists: { [DEFAULT_DATA_DIRECTORY]: true, [DEFAULT_ONBOARDING_FILE]: true }, ...options });
  const defaultFilesystem = createFilesystem({ exists: { [DEFAULT_DATA_DIRECTORY]: true, [DEFAULT_ONBOARDING_FILE]: true }, ...options });
  const explicitFallback = { name }; const defaultFallback = { name };
  const explicit = createExplicit(explicitFilesystem, explicitLogs).readRoot(explicitFallback);
  const candidate = createDefault(defaultFilesystem, defaultLogs).readRoot(defaultFallback);
  assert.deepEqual(candidate, explicit, name);
  if (explicit === explicitFallback) assert.strictEqual(candidate, defaultFallback, `${name} fallback identity`);
  assert.deepEqual(defaultFilesystem.calls, explicitFilesystem.calls, `${name} filesystem calls`);
  assert.deepEqual(defaultLogs, explicitLogs, `${name} logs`);
}

for (const [name, options] of [['mkdir error', { exists: {}, mkdirError: new Error('mkdir') }], ['write error', { exists: { [DEFAULT_DATA_DIRECTORY]: true }, writeError: new Error('write') }]]) {
  const explicitFilesystem = createFilesystem(options); const defaultFilesystem = createFilesystem(options);
  assert.throws(() => createExplicit(explicitFilesystem, []).readRoot(), /mkdir|write/, name);
  assert.throws(() => createDefault(defaultFilesystem, []).readRoot(), /mkdir|write/, name);
  assert.deepEqual(defaultFilesystem.calls, explicitFilesystem.calls, `${name} calls`);
}

{
  const captured = [];
  const factory = createFakeDefaultCommunityOnboardingJsonReaderFactory({ createJsonReader: (input) => { captured.push(input); return {}; } });
  factory.createDefaultCommunityOnboardingJsonReader({ dataDirectory: '/override', filePath: '/override/custom.json', filesystem: { marker: true }, logger: { marker: true } });
  assert.deepEqual(captured[0], { dataDirectory: '/override', filePath: '/override/custom.json', filesystem: { marker: true }, logger: { marker: true } });
}

for (const [label, publication, expected] of [['Guide', 'guide', 'guide'], ['Roadmap', 'roadmap', 'roadmap']]) {
  for (const candidate of [false, true]) {
    const filesystem = createFilesystem({ exists: { [DEFAULT_DATA_DIRECTORY]: true, [DEFAULT_ONBOARDING_FILE]: true }, content: '{"guild":{"guideMessageId":"guide","roadmapMessageId":"roadmap","guideChannelId":"channel"}}' });
    let constructions = 0;
    const reader = candidate
      ? createFakeDefaultCommunityOnboardingJsonReaderFactory({ createJsonReader: (input) => { constructions += 1; return createCommunityOnboardingJsonReader(input); } }).createDefaultCommunityOnboardingJsonReader({ filesystem, pathModule: { basename: () => 'onboarding-flows.json' }, logger: { error() {} } })
      : (() => { constructions += 1; return createExplicit(filesystem, []); })();
    const stateReader = createCommunityOnboardingStateReader({ onboardingJsonReader: reader });
    const result = createCommunityPublicationTrackingReadCompatibilityAdapter({ onboardingStateReader: stateReader }).readTrackedMessage(createCommunityPublicationTrackingReadRequest({ guildId: 'guild', publication }));
    assert.equal(constructions, 1, `${label} construction count`);
    assert.equal(result.trackedMessageId, expected, `${label} tracked message`);
    assert.equal(filesystem.calls.filter(([kind]) => kind === 'read').length, 1, `${label} read count`);
  }
}

for (const candidate of [false, true]) {
  const filesystem = createFilesystem({ exists: { [DEFAULT_DATA_DIRECTORY]: true, [DEFAULT_ONBOARDING_FILE]: true }, content: '{"guild":{"guideChannelId":"channel"}}' });
  let constructions = 0;
  const reader = candidate
    ? createFakeDefaultCommunityOnboardingJsonReaderFactory({ createJsonReader: (input) => { constructions += 1; return createCommunityOnboardingJsonReader(input); } }).createDefaultCommunityOnboardingJsonReader({ filesystem, pathModule: { basename: () => 'onboarding-flows.json' }, logger: { error() {} } })
    : (() => { constructions += 1; return createExplicit(filesystem, []); })();
  const stateReader = createCommunityOnboardingStateReader({ onboardingJsonReader: reader });
  const result = createCommunityPublicationChannelTrackingReadCompatibilityAdapter({ onboardingStateReader: stateReader }).readTrackedChannel(createCommunityPublicationChannelTrackingReadRequest({ guildId: 'guild', publication: 'guide' }));
  assert.equal(constructions, 1); assert.equal(result.trackedChannelId, 'channel');
  assert.equal(filesystem.calls.filter(([kind]) => kind === 'read').length, 1);
}

console.log('Default JsonReader factory candidate preserves paths, overrides, side effects, and Guide/Roadmap/Welcome read behavior.');
