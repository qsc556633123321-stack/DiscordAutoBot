const assert = require('node:assert/strict');
const { createCommunityOnboardingStateReader } = require('../../../src/infrastructure/community/CommunityOnboardingStateReader');

for (const invalid of [undefined, null, {}, { readRoot: null }, 'read']) {
  assert.throws(
    () => createCommunityOnboardingStateReader({ onboardingJsonReader: invalid }),
    new TypeError('CommunityOnboardingStateReader requires onboardingJsonReader.readRoot')
  );
}

const root = { guild: { retained: true } };
const calls = [];
const reader = createCommunityOnboardingStateReader({
  onboardingJsonReader: { readRoot(fallback) { calls.push({ fallback }); return root; } }
});
assert.equal(Object.isFrozen(reader), true);
assert.deepEqual(Object.keys(reader), ['readOnboardingState']);
assert.strictEqual(reader.readOnboardingState(), root);
assert.deepEqual(calls[0].fallback, {});
assert.equal(Object.isFrozen(calls[0].fallback), false);

const values = [{ index: 1 }, { index: 2 }, { index: 3 }];
let index = 0;
const sequential = createCommunityOnboardingStateReader({ onboardingJsonReader: { readRoot() { return values[index++]; } } });
assert.strictEqual(sequential.readOnboardingState(), values[0]);
assert.strictEqual(sequential.readOnboardingState(), values[1]);
assert.strictEqual(sequential.readOnboardingState(), values[2]);
assert.equal(index, 3);
console.log('Community onboarding state reader preserves exact delegation, identity, validation, and fresh reads.');
