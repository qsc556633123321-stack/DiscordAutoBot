const assert = require('node:assert/strict');
const concierge = require('../../src/systems/communityConcierge');
const fixture = require('../fixtures/communityGuideMutationLegacyBaseline');
const { createGuild, createTextChannel, withOnboardingFile } = require('../helpers/createCommunityGuideMutationHarness');

function mutationCalls(calls) { return calls.filter((name) => !name.endsWith('.read')); }

async function main() {
  await withOnboardingFile({ initial: { 'guild-1': {} } }, async ({ log, getState }) => {
    const guide = createTextChannel({ id: 'guide-channel', name: concierge.GUIDE_CHANNEL_NAME, parentId: 'category-existing', log, behavior: {}, label: 'guide' });
    const guild = createGuild({ guideName: concierge.GUIDE_CHANNEL_NAME, roadmapName: concierge.ROADMAP_CHANNEL_NAME, log, behavior: { categoryExists: true }, existingGuide: guide });
    const result = await concierge.setupCommunityGuide(guild, { mode: 'create' });
    assert.equal(result.message.id, 'guide-channel-sent');
    assert.deepEqual(mutationCalls(log.calls), fixture.order.newGuideMessage);
    assert.equal(getState()['guild-1'].guideMessageId, 'guide-channel-sent');
    assert.equal(log.lastSendPayload.embeds.length, 1);
  });

  await withOnboardingFile({ initial: { 'guild-1': { guideMessageId: 'missing' } } }, async ({ log }) => {
    const guide = createTextChannel({ id: 'guide-channel', name: concierge.GUIDE_CHANNEL_NAME, parentId: 'category-existing', log, behavior: { fetchFails: true }, label: 'guide' });
    const guild = createGuild({ guideName: concierge.GUIDE_CHANNEL_NAME, roadmapName: concierge.ROADMAP_CHANNEL_NAME, log, behavior: { categoryExists: true }, existingGuide: guide });
    await concierge.setupCommunityGuide(guild, { mode: 'refresh' });
    assert.equal(log.calls.includes('guide.message.fetch'), true);
    assert.equal(log.calls.includes('guide.message.send'), true, 'fetch failure falls back to send');
  });

  await withOnboardingFile({ initial: { 'guild-1': {} } }, async ({ log }) => {
    const guide = createTextChannel({ id: 'guide-channel', name: concierge.GUIDE_CHANNEL_NAME, parentId: 'category-existing', log, behavior: { sendFails: true }, label: 'guide' });
    const guild = createGuild({ guideName: concierge.GUIDE_CHANNEL_NAME, roadmapName: concierge.ROADMAP_CHANNEL_NAME, log, behavior: { categoryExists: true }, existingGuide: guide });
    await assert.rejects(() => concierge.setupCommunityGuide(guild, { mode: 'create' }), /guide send failure/);
    assert.equal(log.calls.includes('onboarding.write'), false);
  });

  await withOnboardingFile({ initial: { 'guild-1': {} }, writeFails: true }, async ({ log, getState }) => {
    const guide = createTextChannel({ id: 'guide-channel', name: concierge.GUIDE_CHANNEL_NAME, parentId: 'category-existing', log, behavior: {}, label: 'guide' });
    const guild = createGuild({ guideName: concierge.GUIDE_CHANNEL_NAME, roadmapName: concierge.ROADMAP_CHANNEL_NAME, log, behavior: { categoryExists: true }, existingGuide: guide });
    const result = await concierge.setupCommunityGuide(guild, { mode: 'create' });
    assert.equal(result.message.id, 'guide-channel-sent');
    assert.equal(getState()['guild-1'].guideMessageId, undefined, 'send survives an unpersisted record');
    assert.equal(log.errors.some((line) => line.includes('Write onboarding-flows.json failed')), true);
  });

  await withOnboardingFile({ initial: { 'guild-1': {} }, writeFails: true }, async ({ log }) => {
    const guide = createTextChannel({ id: 'guide-channel', name: concierge.GUIDE_CHANNEL_NAME, parentId: 'category-existing', log, behavior: {}, label: 'guide' });
    const guild = createGuild({ guideName: concierge.GUIDE_CHANNEL_NAME, roadmapName: concierge.ROADMAP_CHANNEL_NAME, log, behavior: { categoryExists: true }, existingGuide: guide });
    await concierge.setupCommunityGuide(guild, { mode: 'create' });
    await concierge.setupCommunityGuide(guild, { mode: 'create' });
    assert.equal(log.calls.filter((call) => call === 'guide.message.send').length, 2, 'an unpersisted send is published again on the next invocation');
  });
  console.log('Community Guide new-message publish baseline tests passed.');
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
