const assert = require('node:assert/strict');
const concierge = require('../../src/systems/communityConcierge');
const { createGuild, createMessage, createTextChannel, withOnboardingFile } = require('../helpers/createCommunityGuideMutationHarness');

(async () => {
  await withOnboardingFile({ initial: { 'guild-1': { guideMessageId: 'tracked' } } }, async ({ log }) => {
    const guide = createTextChannel({ id: 'guide-channel', name: concierge.GUIDE_CHANNEL_NAME, parentId: 'category-existing', log, behavior: { existingMessage: createMessage('tracked', log) }, label: 'guide' });
    const guild = createGuild({ guideName: concierge.GUIDE_CHANNEL_NAME, roadmapName: concierge.ROADMAP_CHANNEL_NAME, log, behavior: { categoryExists: true }, existingGuide: guide });
    await concierge.setupCommunityGuide(guild);
    assert.equal(log.calls.filter((call) => call === 'onboarding.read').length, 2);
    assert.equal(log.calls.filter((call) => call === 'guide.message.fetch').length, 1);
    assert.equal(log.calls.filter((call) => call === 'guide.message.edit').length, 1);
    assert.equal(log.calls.filter((call) => call === 'guide.message.send').length, 0);
    assert.equal(log.calls.filter((call) => call === 'onboarding.write').length, 1);
  });
  console.log('community Guide mutation Plan branch runtime call count passed');
})().catch((error) => { console.error(error); process.exitCode = 1; });
