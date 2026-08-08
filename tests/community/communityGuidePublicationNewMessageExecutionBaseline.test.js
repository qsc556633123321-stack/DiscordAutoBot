const assert = require('node:assert/strict');
const concierge = require('../../src/systems/communityConcierge');
const { createGuild, createTextChannel, withOnboardingFile } = require('../helpers/createCommunityGuideMutationHarness');

function guide(log, behavior = {}) { return createTextChannel({ id: 'guide-channel', name: concierge.GUIDE_CHANNEL_NAME, parentId: 'category-existing', log, behavior, label: 'guide' }); }

(async () => {
  await withOnboardingFile({ initial: { 'guild-1': {} } }, async ({ log, getState }) => {
    const guild = createGuild({ guideName: concierge.GUIDE_CHANNEL_NAME, roadmapName: concierge.ROADMAP_CHANNEL_NAME, log, behavior: { categoryExists: true }, existingGuide: guide(log) });
    const result = await concierge.setupCommunityGuide(guild, { mode: 'normal' });
    assert.equal(result.message.id, 'guide-channel-sent');
    assert.deepEqual(log.calls.filter((call) => !call.endsWith('.read')), ['guide.overwrite.set', 'guide.message.send', 'onboarding.write']);
    assert.equal(log.lastSendPayload.embeds.length, 1);
    assert.equal(getState()['guild-1'].guideMessageId, 'guide-channel-sent');
  });
  for (const behavior of [{ fetchFails: true }, { existingMessage: null }]) {
    await withOnboardingFile({ initial: { 'guild-1': { guideMessageId: 'missing' } } }, async ({ log }) => {
      const guild = createGuild({ guideName: concierge.GUIDE_CHANNEL_NAME, roadmapName: concierge.ROADMAP_CHANNEL_NAME, log, behavior: { categoryExists: true }, existingGuide: guide(log, behavior) });
      await concierge.setupCommunityGuide(guild, { mode: 'refresh' });
      assert.equal(log.calls.includes('guide.message.fetch'), true);
      assert.equal(log.calls.includes('guide.message.send'), true);
    });
  }
  await withOnboardingFile({ initial: { 'guild-1': {} } }, async ({ log }) => {
    const guild = createGuild({ guideName: concierge.GUIDE_CHANNEL_NAME, roadmapName: concierge.ROADMAP_CHANNEL_NAME, log, behavior: { categoryExists: true }, existingGuide: guide(log, { sendFails: true }) });
    await assert.rejects(() => concierge.setupCommunityGuide(guild), /guide send failure/);
    assert.equal(log.calls.includes('onboarding.write'), false);
  });
  console.log('community Guide publication new-message execution baseline passed');
})().catch((error) => { console.error(error); process.exitCode = 1; });
