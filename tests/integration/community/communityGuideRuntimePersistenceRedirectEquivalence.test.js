const assert = require('node:assert/strict');
const { createFakeCommunityGuideRuntimePersistenceRedirect } = require('../../fakes/community/FakeCommunityGuideRuntimePersistenceRedirect');
const { NATIVE_ONBOARDING_RECOMMENDATIONS } = require('../../../src/systems/communityConcierge');

const excluded = ['🎮｜目前語音房', '🎮｜遊戲中心'];
let genericInput;
let executeCount = 0;
const redirect = createFakeCommunityGuideRuntimePersistenceRedirect({
  createGenericFeature() {
    return { persistCommunityPublicationRecord: { execute(input) {
      executeCount += 1;
      genericInput = input;
      return { persisted: true, record: input.patch };
    } } };
  }
});

assert.strictEqual(redirect.persistAfterGuideMutation({
  guild: { id: 'G' }, channel: { id: 'C' }, message: { id: 'M' },
  nativeTaskRecommendations: NATIVE_ONBOARDING_RECOMMENDATIONS,
  nativeTaskExcludedChannels: excluded
}), undefined);
assert.equal(executeCount, 1);
assert.deepEqual(genericInput, {
  guildId: 'G',
  patch: {
    guideChannelId: 'C', guideMessageId: 'M',
    nativeTaskRecommendations: NATIVE_ONBOARDING_RECOMMENDATIONS,
    nativeTaskExcludedChannels: excluded
  }
});
assert.strictEqual(genericInput.patch.nativeTaskRecommendations, NATIVE_ONBOARDING_RECOMMENDATIONS);
assert.strictEqual(genericInput.patch.nativeTaskExcludedChannels, excluded);
console.log('Guide runtime redirect candidate preserves exact four-value request equivalence and ignores persistence result.');
