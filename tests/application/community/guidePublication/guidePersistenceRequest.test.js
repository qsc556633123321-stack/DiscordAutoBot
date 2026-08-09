const assert = require('node:assert/strict');
const {
  createGuidePersistenceRequest,
  mapGuidePersistenceRequestToGenericInput
} = require('../../../../src/application/community/guidePublication/GuidePersistenceRequest');

const recommendations = [{ label: 'exact' }];
const excluded = ['channel'];
const request = createGuidePersistenceRequest({
  guildId: 'G', channelId: 'C', messageId: 'M',
  nativeTaskRecommendations: recommendations, nativeTaskExcludedChannels: excluded
});
assert.deepEqual(Object.keys(request), ['guildId', 'channelId', 'messageId', 'nativeTaskRecommendations', 'nativeTaskExcludedChannels']);
assert.equal(Object.isFrozen(request), true);
assert.strictEqual(request.nativeTaskRecommendations, recommendations);
assert.strictEqual(request.nativeTaskExcludedChannels, excluded);
assert.equal(Object.isFrozen(recommendations), false);
assert.equal(Object.isFrozen(excluded), false);

for (const value of ['', 0, false, null, undefined, { exact: true }]) {
  const raw = createGuidePersistenceRequest({
    guildId: value, channelId: value, messageId: value,
    nativeTaskRecommendations: value, nativeTaskExcludedChannels: value
  });
  for (const key of Object.keys(raw)) assert.strictEqual(raw[key], value);
  const mapped = mapGuidePersistenceRequestToGenericInput(raw);
  assert.strictEqual(mapped.guildId, value);
  assert.strictEqual(mapped.patch.guideChannelId, value);
  assert.strictEqual(mapped.patch.guideMessageId, value);
  assert.strictEqual(mapped.patch.nativeTaskRecommendations, value);
  assert.strictEqual(mapped.patch.nativeTaskExcludedChannels, value);
}

const mapped = mapGuidePersistenceRequestToGenericInput(request);
assert.deepEqual(mapped, {
  guildId: 'G',
  patch: {
    guideChannelId: 'C', guideMessageId: 'M',
    nativeTaskRecommendations: recommendations, nativeTaskExcludedChannels: excluded
  }
});
assert.equal(Object.isFrozen(mapped), true);
assert.equal(Object.isFrozen(mapped.patch), true);
assert.strictEqual(mapped.patch.nativeTaskRecommendations, recommendations);
assert.strictEqual(mapped.patch.nativeTaskExcludedChannels, excluded);
console.log('Guide persistence request preserves exact raw values, native identities, and a frozen envelope.');
