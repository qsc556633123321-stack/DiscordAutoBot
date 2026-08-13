const assert = require('node:assert/strict');
const { createFakeCommunityOnboardingFilesystemBoundary } = require('../../fakes/community/FakeCommunityOnboardingFilesystemBoundary');
const { createFakeCommunityFilesystemRuntimeConstruction } = require('../../fakes/community/FakeCommunityFilesystemRuntimeConstruction');

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

function legacyReadJson(filesystem, logger, fallback = {}) {
  if (!filesystem.existsSync(DATA_DIRECTORY)) filesystem.mkdirSync(DATA_DIRECTORY, { recursive: true });
  if (!filesystem.existsSync(FILE_PATH)) filesystem.writeFileSync(FILE_PATH, JSON.stringify(fallback, null, 2), 'utf8');
  try {
    const parsed = JSON.parse(filesystem.readFileSync(FILE_PATH, 'utf8') || '{}');
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : fallback;
  } catch (error) {
    logger.error('Read onboarding-flows.json failed:', error);
    return fallback;
  }
}

function candidateRead(filesystem, logger, fallback = {}) {
  return createFakeCommunityOnboardingFilesystemBoundary({ dataDirectory: DATA_DIRECTORY, filePath: FILE_PATH, filesystem, pathModule: { basename: () => 'onboarding-flows.json' }, logger }).readOnboardingState(fallback);
}

for (const [name, content, fallback] of [
  ['valid object', '{"guild":{"guideMessageId":"m"}}', {}], ['multi guild object', '{"a":{},"b":{"roadmapMessageId":"r"}}', {}], ['empty file', '', { fallback: true }], ['null root', 'null', { fallback: true }], ['array root', '[]', { fallback: true }], ['string root', '"x"', { fallback: true }], ['number root', '1', { fallback: true }], ['boolean root', 'true', { fallback: true }]
]) {
  const legacyFilesystem = createFilesystem({ exists: { [DATA_DIRECTORY]: true, [FILE_PATH]: true }, content });
  const candidateFilesystem = createFilesystem({ exists: { [DATA_DIRECTORY]: true, [FILE_PATH]: true }, content });
  const legacyLogs = []; const candidateLogs = [];
  const legacy = legacyReadJson(legacyFilesystem, { error: (...args) => legacyLogs.push(args) }, fallback);
  const candidate = candidateRead(candidateFilesystem, { error: (...args) => candidateLogs.push(args) }, fallback);
  assert.deepEqual(candidate, legacy, name); assert.deepEqual(candidateFilesystem.calls, legacyFilesystem.calls, `${name} IO ordering`); assert.deepEqual(candidateLogs, legacyLogs, `${name} logging`);
}

{
  const legacyFilesystem = createFilesystem({ exists: {} }); const candidateFilesystem = createFilesystem({ exists: {} });
  assert.deepEqual(candidateRead(candidateFilesystem, { error() {} }), legacyReadJson(legacyFilesystem, { error() {} }));
  assert.deepEqual(candidateFilesystem.calls, legacyFilesystem.calls);
  assert.deepEqual(candidateFilesystem.calls, [['exists', DATA_DIRECTORY], ['mkdir', DATA_DIRECTORY, { recursive: true }], ['exists', FILE_PATH], ['write', FILE_PATH, '{}', 'utf8'], ['read', FILE_PATH, 'utf8']]);
}

for (const [label, options] of [['malformed JSON', { content: '{bad' }], ['read error', { content: '{}', readError: new Error('read failed') }]]) {
  const fallback = { keep: label };
  const legacyFilesystem = createFilesystem({ exists: { [DATA_DIRECTORY]: true, [FILE_PATH]: true }, ...options }); const candidateFilesystem = createFilesystem({ exists: { [DATA_DIRECTORY]: true, [FILE_PATH]: true }, ...options });
  const legacyLogs = []; const candidateLogs = [];
  assert.equal(legacyReadJson(legacyFilesystem, { error: (...args) => legacyLogs.push(args) }, fallback), fallback); assert.equal(candidateRead(candidateFilesystem, { error: (...args) => candidateLogs.push(args) }, fallback), fallback);
  assert.deepEqual(candidateFilesystem.calls, legacyFilesystem.calls); assert.equal(candidateLogs.length, 1); assert.deepEqual(candidateLogs.map((args) => args[0]), legacyLogs.map((args) => args[0]));
}

for (const [label, options] of [['mkdir failure', { exists: {}, mkdirError: new Error('mkdir failed') }], ['create failure', { exists: { [DATA_DIRECTORY]: true }, writeError: new Error('create failed') }]]) {
  const legacyFilesystem = createFilesystem(options); const candidateFilesystem = createFilesystem(options); const expected = options.mkdirError || options.writeError;
  assert.throws(() => legacyReadJson(legacyFilesystem, { error() {} }), expected, label); assert.throws(() => candidateRead(candidateFilesystem, { error() {} }), expected, label); assert.deepEqual(candidateFilesystem.calls, legacyFilesystem.calls);
}

{
  const filesystem = createFilesystem({ exists: { [DATA_DIRECTORY]: true, [FILE_PATH]: true }, content: '{"guild":{}}' });
  const boundary = createFakeCommunityOnboardingFilesystemBoundary({ dataDirectory: DATA_DIRECTORY, filePath: FILE_PATH, filesystem, pathModule: { basename: () => 'onboarding-flows.json' }, logger: { error() {} } });
  assert.notEqual(boundary.readOnboardingState(), boundary.readOnboardingState(), 'each read parses fresh state; no cache is introduced'); assert.equal(filesystem.calls.filter(([kind]) => kind === 'read').length, 2);
}

{
  let constructions = 0; let reads = 0;
  const runtime = createFakeCommunityFilesystemRuntimeConstruction({ filePath: FILE_PATH, createBoundary() { constructions += 1; return { readOnboardingState() { reads += 1; return {}; } }; } });
  for (const flow of ['guide', 'roadmap', 'welcome']) runtime.createReader().readOnboardingState();
  assert.equal(constructions, 3); assert.equal(reads, 3);
}

console.log('Filesystem ownership candidate exactly characterizes current onboarding read behavior.');
