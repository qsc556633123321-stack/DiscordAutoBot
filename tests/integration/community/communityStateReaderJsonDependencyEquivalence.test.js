const assert = require('node:assert/strict');
const { createCommunityOnboardingStateReader } = require('../../../src/infrastructure/community/CommunityOnboardingStateReader');
const { createFakeCommunityOnboardingStateReaderJsonDependency } = require('../../fakes/community/FakeCommunityOnboardingStateReaderJsonDependency');
const { createFakeCommunityStateReaderJsonRuntimeConstruction } = require('../../fakes/community/FakeCommunityStateReaderJsonRuntimeConstruction');

for (const value of [{ guild: {} }, {}, null, [], 'text', 0, false]) {
  const production = createCommunityOnboardingStateReader({ onboardingJsonReader: { readRoot(fallback) { assert.deepEqual(fallback, {}); return value; } } });
  const candidate = createFakeCommunityOnboardingStateReaderJsonDependency({ onboardingJsonReader: { readRoot(fallback) { assert.deepEqual(fallback, {}); return value; } } });
  assert.equal(candidate.readOnboardingState(), production.readOnboardingState(), 'candidate preserves exact root identity');
}

{
  const sentinel = new Error('reader failed');
  const candidate = createFakeCommunityOnboardingStateReaderJsonDependency({ onboardingJsonReader: { readRoot() { throw sentinel; } } });
  assert.throws(() => candidate.readOnboardingState(), sentinel);
}

for (const value of [undefined, null, {}, { readRoot: null }]) {
  assert.throws(() => createFakeCommunityOnboardingStateReaderJsonDependency({ onboardingJsonReader: value }), new TypeError('CommunityOnboardingStateReader requires onboardingJsonReader.readRoot'));
}

{
  let constructed = 0; let reads = 0;
  const runtime = createFakeCommunityStateReaderJsonRuntimeConstruction({
    createOnboardingJsonReader() { constructed += 1; return { readRoot(fallback) { reads += 1; assert.deepEqual(fallback, {}); return { guild: {} }; } }; }
  });
  for (const create of [runtime.createGuideReader, runtime.createRoadmapReader, runtime.createWelcomeReader]) create().readOnboardingState();
  assert.equal(constructed, 3); assert.equal(reads, 3);
}

console.log('StateReader JSON dependency candidate preserves delegation, identity, failures, validation, and per-invocation construction.');
