const assert = require('node:assert/strict');
const concierge = require('../../../src/systems/communityConcierge');
const { createGuild, createTextChannel, withOnboardingFile } = require('../../helpers/createCommunityGuideMutationHarness');

(async () => {
  await withOnboardingFile({ initial: { 'guild-1': { nativeTaskRecommendations: ['old'], nativeTaskExcludedChannels: ['old-channel'] } } }, async ({ log, getState }) => {
    const guide = createTextChannel({ id: 'guide-channel', name: concierge.GUIDE_CHANNEL_NAME, parentId: 'category-existing', log, label: 'guide' });
    const guild = createGuild({ guideName: concierge.GUIDE_CHANNEL_NAME, roadmapName: concierge.ROADMAP_CHANNEL_NAME, log, behavior: { categoryExists: true }, existingGuide: guide });
    await concierge.setupCommunityGuide(guild, { mode: 'create' });
    const record = getState()['guild-1'];
    assert.equal(Array.isArray(record.nativeTaskRecommendations), true);
    assert.equal(Array.isArray(record.nativeTaskExcludedChannels), true);
    assert.equal(record.nativeTaskRecommendations.length > 0, true);
    assert.equal(record.nativeTaskExcludedChannels.length > 0, true);
    assert.equal(log.calls.filter((call) => call === 'onboarding.write').length, 1);
    assert.ok(log.calls.lastIndexOf('onboarding.write') > log.calls.indexOf('guide.message.send'));
  });
  console.log('Guide native recommendation state is persisted in the same single legacy write.');
})().catch((error) => { console.error(error); process.exitCode = 1; });
