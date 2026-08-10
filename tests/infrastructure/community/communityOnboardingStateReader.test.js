const assert = require('node:assert/strict');
const { createCommunityOnboardingStateReader } = require('../../../src/infrastructure/community/CommunityOnboardingStateReader');

for (const invalid of [undefined, null, {}, 'read']) {
  assert.throws(
    () => createCommunityOnboardingStateReader({ filePath: 'onboarding-flows.json', readJson: invalid }),
    new TypeError('CommunityOnboardingStateReader requires readJson')
  );
}

const root = { guild: { retained: true } };
const calls = [];
const reader = createCommunityOnboardingStateReader({
  filePath: 'exact-onboarding-path.json',
  readJson(filePath, fallback) { calls.push({ filePath, fallback }); return root; }
});
assert.equal(Object.isFrozen(reader), true);
assert.deepEqual(Object.keys(reader), ['readOnboardingState']);
assert.strictEqual(reader.readOnboardingState(), root);
assert.equal(calls[0].filePath, 'exact-onboarding-path.json');
assert.deepEqual(calls[0].fallback, {});
assert.equal(Object.isFrozen(calls[0].fallback), false);

const values = [{ index: 1 }, { index: 2 }, { index: 3 }];
let index = 0;
const sequential = createCommunityOnboardingStateReader({ filePath: 'state.json', readJson() { return values[index++]; } });
assert.strictEqual(sequential.readOnboardingState(), values[0]);
assert.strictEqual(sequential.readOnboardingState(), values[1]);
assert.strictEqual(sequential.readOnboardingState(), values[2]);
assert.equal(index, 3);
console.log('Community onboarding state reader preserves exact delegation, identity, validation, and fresh reads.');
