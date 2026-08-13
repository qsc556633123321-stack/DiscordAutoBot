const assert = require('node:assert/strict');
const { createCommunityOnboardingStateReader } = require('../../../src/infrastructure/community/CommunityOnboardingStateReader');

const roots = [{ guide: {} }, { roadmap: {} }, { welcome: {} }];
let reads = 0;
const onboardingJsonReader = { readRoot(fallback) { assert.deepEqual(fallback, {}); return roots[reads++]; } };
const reader = createCommunityOnboardingStateReader({ onboardingJsonReader });
assert.strictEqual(reader.readOnboardingState(), roots[0]);
assert.strictEqual(reader.readOnboardingState(), roots[1]);
assert.strictEqual(reader.readOnboardingState(), roots[2]);
assert.equal(reads, 3);
const failure = new Error('sentinel');
assert.throws(() => createCommunityOnboardingStateReader({ onboardingJsonReader: { readRoot() { throw failure; } } }).readOnboardingState(), failure);
console.log('Production StateReader JSON dependency preserves one-read delegation, root identity, fresh fallback, and throw identity.');
