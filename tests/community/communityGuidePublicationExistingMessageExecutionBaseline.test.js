const assert = require('node:assert/strict');
const concierge = require('../../src/systems/communityConcierge');
const { createGuild, createMessage, createTextChannel, withOnboardingFile } = require('../helpers/createCommunityGuideMutationHarness');

(async () => {
  await withOnboardingFile({ initial: { 'guild-1': { guideMessageId: 'tracked', unknown: 'keep', roadmapMessageId: 'roadmap' } } }, async ({ log, getState }) => {
    const message = createMessage('tracked', log);
    const guide = createTextChannel({ id: 'guide-channel', name: concierge.GUIDE_CHANNEL_NAME, parentId: 'category-existing', log, behavior: { existingMessage: message }, label: 'guide' });
    const guild = createGuild({ guideName: concierge.GUIDE_CHANNEL_NAME, roadmapName: concierge.ROADMAP_CHANNEL_NAME, log, behavior: { categoryExists: true }, existingGuide: guide });
    const result = await concierge.setupCommunityGuide(guild, { mode: 'refresh' });
    assert.equal(result.message.id, 'tracked');
    assert.deepEqual(log.calls.filter((call) => !call.endsWith('.read')), ['guide.overwrite.set', 'guide.message.fetch', 'guide.message.edit', 'onboarding.write']);
    assert.equal(log.calls.includes('guide.message.send'), false);
    assert.equal(getState()['guild-1'].guideMessageId, 'tracked');
    assert.equal(getState()['guild-1'].unknown, 'keep');
    assert.equal(getState()['guild-1'].roadmapMessageId, 'roadmap');
  });
  await withOnboardingFile({ initial: { 'guild-1': { guideMessageId: 'tracked' } } }, async ({ log }) => {
    const guide = createTextChannel({ id: 'guide-channel', name: concierge.GUIDE_CHANNEL_NAME, parentId: 'category-existing', log, behavior: { existingMessage: createMessage('tracked', log, { editFails: true }) }, label: 'guide' });
    const guild = createGuild({ guideName: concierge.GUIDE_CHANNEL_NAME, roadmapName: concierge.ROADMAP_CHANNEL_NAME, log, behavior: { categoryExists: true }, existingGuide: guide });
    await assert.rejects(() => concierge.setupCommunityGuide(guild, { mode: 'normal' }), /guide edit failure/);
    assert.equal(log.calls.includes('onboarding.write'), false);
    assert.equal(log.calls.includes('guide.message.send'), false);
  });
  console.log('community Guide publication existing-message execution baseline passed');
})().catch((error) => { console.error(error); process.exitCode = 1; });
