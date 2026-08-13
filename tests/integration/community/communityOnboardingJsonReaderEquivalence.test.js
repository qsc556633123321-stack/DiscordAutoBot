const assert = require('node:assert/strict');
const { createCommunityOnboardingJsonReader } = require('../../../src/infrastructure/community/CommunityOnboardingJsonReader');

const directory = '/data'; const file = '/data/onboarding-flows.json';
function makeFs(content, error) {
  const calls = []; const exists = { [directory]: true, [file]: true };
  return { calls, existsSync(value) { calls.push(['exists', value]); return exists[value]; }, mkdirSync(value, options) { calls.push(['mkdir', value, options]); exists[value] = true; }, writeFileSync(value, data, encoding) { calls.push(['write', value, data, encoding]); exists[value] = true; content = data; }, readFileSync(value, encoding) { calls.push(['read', value, encoding]); if (error) throw error; return content; } };
}
function legacy(filesystem, logger, fallback) {
  if (!filesystem.existsSync(directory)) filesystem.mkdirSync(directory, { recursive: true });
  if (!filesystem.existsSync(file)) filesystem.writeFileSync(file, JSON.stringify(fallback, null, 2), 'utf8');
  try { const parsed = JSON.parse(filesystem.readFileSync(file, 'utf8') || '{}'); return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : fallback; } catch (error) { logger.error('Read onboarding-flows.json failed:', error); return fallback; }
}
for (const [content, failure] of [['{}'], ['{"g":{}}'], [''], ['null'], ['[]'], ['{bad'], ['{}', new Error('read')]]) {
  const legacyFs = makeFs(content, failure); const readerFs = makeFs(content, failure); const legacyLogs = []; const readerLogs = []; const fallback = { fallback: content };
  const oldResult = legacy(legacyFs, { error: (...args) => legacyLogs.push(args) }, fallback);
  const reader = createCommunityOnboardingJsonReader({ dataDirectory: directory, filePath: file, filesystem: readerFs, pathModule: { basename: () => 'onboarding-flows.json' }, logger: { error: (...args) => readerLogs.push(args) } });
  const newResult = reader.readRoot(fallback);
  assert.deepEqual(newResult, oldResult); assert.deepEqual(readerFs.calls, legacyFs.calls); assert.deepEqual(readerLogs.map((entry) => entry[0]), legacyLogs.map((entry) => entry[0]));
}
console.log('Production onboarding JSON reader is equivalent to the frozen legacy filesystem read contract.');
