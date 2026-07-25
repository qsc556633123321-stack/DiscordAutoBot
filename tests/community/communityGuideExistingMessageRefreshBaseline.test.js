const assert = require('node:assert/strict');
const concierge = require('../../src/systems/communityConcierge');
const fixture = require('../fixtures/communityGuideMutationLegacyBaseline');
const { createGuild, createMessage, createTextChannel, withOnboardingFile } = require('../helpers/createCommunityGuideMutationHarness');

function mutationCalls(calls) {
  return calls.filter((name) => !name.endsWith('.read'));
}

async function main() {
  await withOnboardingFile({ initial: { 'guild-1': { guideMessageId: 'tracked-guide', unrelated: 'keep' } } }, async ({ log, getState }) => {
    const message = createMessage('tracked-guide', log);
    const guide = createTextChannel({
      id: 'guide-channel', name: concierge.GUIDE_CHANNEL_NAME, parentId: 'category-existing', log,
      behavior: { existingMessage: message }, label: 'guide'
    });
    const guild = createGuild({
      guideName: concierge.GUIDE_CHANNEL_NAME, roadmapName: concierge.ROADMAP_CHANNEL_NAME, log,
      behavior: { categoryExists: true }, existingGuide: guide
    });
    const result = await concierge.setupCommunityGuide(guild, { mode: 'refresh' });
    assert.equal(result.message.id, 'tracked-guide');
    assert.equal(log.calls.includes('guide.message.send'), false);
    assert.equal(log.calls.includes('guide.channel.create'), false);
    assert.equal(log.calls.includes('guide.channel.setParent'), false);
    assert.deepEqual(mutationCalls(log.calls), fixture.order.existingGuideMessage);
    assert.equal(getState()['guild-1'].unrelated, 'keep');
    assert.equal(getState()['guild-1'].guideMessageId, 'tracked-guide');
  });

  await withOnboardingFile({ initial: { 'guild-1': { guideMessageId: 'tracked-guide' } } }, async ({ log }) => {
    const guide = createTextChannel({
      id: 'guide-channel', name: concierge.GUIDE_CHANNEL_NAME, parentId: 'category-existing', log,
      behavior: { existingMessage: createMessage('tracked-guide', log, { editFails: true }) }, label: 'guide'
    });
    const guild = createGuild({ guideName: concierge.GUIDE_CHANNEL_NAME, roadmapName: concierge.ROADMAP_CHANNEL_NAME, log, behavior: { categoryExists: true }, existingGuide: guide });
    await assert.rejects(() => concierge.setupCommunityGuide(guild, { mode: 'refresh' }), /guide edit failure/);
    assert.equal(log.calls.includes('guide.message.send'), false, 'edit failure must not fall back to send');
    assert.equal(log.calls.includes('onboarding.write'), false, 'failed edit must not persist a record');
  });
  console.log('Community Guide existing-message refresh baseline tests passed.');
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
