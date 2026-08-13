const assert = require('node:assert/strict');
const { createCommunityOnboardingJsonReader } = require('../../../src/infrastructure/community/CommunityOnboardingJsonReader');

const DATA_DIRECTORY = '/data';
const FILE_PATH = '/data/onboarding-flows.json';

function createFilesystem({ exists = {}, content = '{}', readError, mkdirError, writeError } = {}) {
  const calls = [];
  return { calls,
    existsSync(target) { calls.push(['exists', target]); return Boolean(exists[target]); },
    mkdirSync(target, options) { calls.push(['mkdir', target, options]); if (mkdirError) throw mkdirError; exists[target] = true; },
    writeFileSync(target, value, encoding) { calls.push(['write', target, value, encoding]); if (writeError) throw writeError; exists[target] = true; content = value; },
    readFileSync(target, encoding) { calls.push(['read', target, encoding]); if (readError) throw readError; return content; }
  };
}

function createReader(filesystem, logs = []) {
  return createCommunityOnboardingJsonReader({ dataDirectory: DATA_DIRECTORY, filePath: FILE_PATH, filesystem, pathModule: { basename: () => 'onboarding-flows.json' }, logger: { error: (...args) => logs.push(args) } });
}

for (const [name, content, expected] of [['valid empty object', '{}', {}], ['multi guild', '{"a":{},"b":{"guideChannelId":"c"}}', { a: {}, b: { guideChannelId: 'c' } }]]) {
  const filesystem = createFilesystem({ exists: { [DATA_DIRECTORY]: true, [FILE_PATH]: true }, content });
  const reader = createReader(filesystem);
  assert.deepEqual(reader.readRoot(), expected, name);
  assert.equal(Object.isFrozen(reader), true);
  assert.deepEqual(Object.keys(reader), ['readRoot']);
}

{
  const filesystem = createFilesystem({ exists: {} });
  assert.deepEqual(createReader(filesystem).readRoot(), {});
  assert.deepEqual(filesystem.calls, [['exists', DATA_DIRECTORY], ['mkdir', DATA_DIRECTORY, { recursive: true }], ['exists', FILE_PATH], ['write', FILE_PATH, '{}', 'utf8'], ['read', FILE_PATH, 'utf8']]);
}

for (const [name, content] of [['empty', ''], ['null', 'null'], ['array', '[]'], ['string', '"text"'], ['number', '1'], ['true', 'true'], ['false', 'false']]) {
  const fallback = { fallback: name };
  const logs = [];
  const filesystem = createFilesystem({ exists: { [DATA_DIRECTORY]: true, [FILE_PATH]: true }, content });
  const result = createReader(filesystem, logs).readRoot(fallback);
  if (name === 'empty') assert.notEqual(result, fallback, 'empty file parses a fresh object');
  else assert.equal(result, fallback, `${name} root preserves fallback identity`);
  assert.equal(logs.length, 0, `${name} root does not log`);
}

for (const [name, options] of [['malformed', { content: '{bad' }], ['read error', { readError: new Error('read') }]]) {
  const fallback = { fallback: name }; const logs = [];
  const result = createReader(createFilesystem({ exists: { [DATA_DIRECTORY]: true, [FILE_PATH]: true }, ...options }), logs).readRoot(fallback);
  assert.equal(result, fallback); assert.equal(logs.length, 1); assert.equal(logs[0][0], 'Read onboarding-flows.json failed:'); assert.equal(logs[0][1], options.readError || logs[0][1]);
}

for (const [name, options] of [['mkdir', { exists: {}, mkdirError: new Error('mkdir') }], ['write', { exists: { [DATA_DIRECTORY]: true }, writeError: new Error('write') }]]) {
  const expected = options.mkdirError || options.writeError; const logs = [];
  assert.throws(() => createReader(createFilesystem(options), logs).readRoot(), expected, name); assert.equal(logs.length, 0, `${name} failure does not log`);
}

{
  const filesystem = createFilesystem({ exists: { [DATA_DIRECTORY]: true, [FILE_PATH]: true }, content: '{"guild":{}}' });
  const reader = createReader(filesystem);
  assert.notEqual(reader.readRoot(), reader.readRoot()); assert.equal(filesystem.calls.filter(([kind]) => kind === 'read').length, 2);
}

for (const [options, expected] of [
  [{ filesystem: null }, 'CommunityOnboardingJsonReader requires filesystem'],
  [{ filesystem: {} }, 'CommunityOnboardingJsonReader requires filesystem.existsSync'],
  [{ filesystem: { existsSync() {} } }, 'CommunityOnboardingJsonReader requires filesystem.mkdirSync'],
  [{ filesystem: { existsSync() {}, mkdirSync() {} } }, 'CommunityOnboardingJsonReader requires filesystem.writeFileSync'],
  [{ filesystem: { existsSync() {}, mkdirSync() {}, writeFileSync() {} } }, 'CommunityOnboardingJsonReader requires filesystem.readFileSync'],
  [{ filesystem: createFilesystem(), pathModule: {} }, 'CommunityOnboardingJsonReader requires pathModule.basename'],
  [{ filesystem: createFilesystem(), pathModule: { basename() {} }, logger: {} }, 'CommunityOnboardingJsonReader requires logger.error']
]) assert.throws(() => createCommunityOnboardingJsonReader(options), new TypeError(expected));

console.log('Community onboarding JSON reader preserves filesystem compatibility, validation, identity, and freshness contracts.');
