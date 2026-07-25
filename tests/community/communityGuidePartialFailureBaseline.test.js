const assert = require('node:assert/strict');
const concierge = require('../../src/systems/communityConcierge');
const { createGuild, createTextChannel, withOnboardingFile } = require('../helpers/createCommunityGuideMutationHarness');

function existingGuide(log, behavior = {}) {
  return createTextChannel({ id: 'guide-channel', name: concierge.GUIDE_CHANNEL_NAME, parentId: 'category-existing', log, behavior, label: 'guide' });
}

async function main() {
  await withOnboardingFile({ initial: {} }, async ({ log }) => {
    const guild = createGuild({ guideName: concierge.GUIDE_CHANNEL_NAME, roadmapName: concierge.ROADMAP_CHANNEL_NAME, log, behavior: { guideChannelCreateFails: true } });
    await assert.rejects(() => concierge.setupCommunityGuide(guild), /guide channel create failure/);
    assert.deepEqual(log.calls.filter((call) => !call.endsWith('.read')), ['category.create', 'guide.channel.create']);
  });

  await withOnboardingFile({ initial: { 'guild-1': {} } }, async ({ log }) => {
    const guild = createGuild({
      guideName: concierge.GUIDE_CHANNEL_NAME, roadmapName: concierge.ROADMAP_CHANNEL_NAME, log,
      behavior: { categoryExists: true }, existingGuide: existingGuide(log, { overwriteFails: true })
    });
    await concierge.setupCommunityGuide(guild);
    assert.equal(log.calls.includes('guide.overwrite.set'), true);
    assert.equal(log.calls.includes('guide.message.send'), true);
  });

  await withOnboardingFile({ initial: { 'guild-1': {} } }, async ({ log }) => {
    const guild = createGuild({
      guideName: concierge.GUIDE_CHANNEL_NAME, roadmapName: concierge.ROADMAP_CHANNEL_NAME, log,
      behavior: { categoryExists: true }, existingGuide: existingGuide(log, { sendFails: true })
    });
    await assert.rejects(() => concierge.setupCommunityGuide(guild), /guide send failure/);
    assert.equal(log.calls.includes('onboarding.write'), false);
  });

  await withOnboardingFile({ initial: { 'guild-1': {} }, writeFailAt: 2 }, async ({ log, getState }) => {
    const guide = existingGuide(log);
    const roadmap = createTextChannel({ id: 'roadmap-channel', name: concierge.ROADMAP_CHANNEL_NAME, parentId: 'category-existing', log, behavior: {}, label: 'roadmap' });
    const guild = createGuild({
      guideName: concierge.GUIDE_CHANNEL_NAME, roadmapName: concierge.ROADMAP_CHANNEL_NAME, log,
      behavior: { categoryExists: true }, existingGuide: guide, existingRoadmap: roadmap
    });
    await concierge.setupCommunityGuide(guild);
    await concierge.setupRoadmapPanel(guild);
    assert.equal(getState()['guild-1'].guideMessageId, 'guide-channel-sent');
    assert.equal(getState()['guild-1'].roadmapMessageId, undefined, 'second write failure leaves Roadmap publication untracked');
    assert.equal(log.calls.includes('roadmap.message.send'), true);
  });

  await withOnboardingFile({ initial: { 'guild-1': { roadmapMessageId: 'roadmap-existing' } } }, async ({ log }) => {
    const roadmap = createTextChannel({
      id: 'roadmap-channel', name: concierge.ROADMAP_CHANNEL_NAME, parentId: 'category-existing', log,
      behavior: { existingMessage: createTextChannel }, label: 'roadmap'
    });
    roadmap.messages.fetch = async () => {
      log.calls.push('roadmap.message.fetch');
      return { async edit() { log.calls.push('roadmap.message.edit'); throw new Error('roadmap edit failure'); } };
    };
    const guild = createGuild({ guideName: concierge.GUIDE_CHANNEL_NAME, roadmapName: concierge.ROADMAP_CHANNEL_NAME, log, behavior: { categoryExists: true }, existingRoadmap: roadmap });
    await assert.rejects(() => concierge.setupRoadmapPanel(guild), /roadmap edit failure/);
    assert.equal(log.calls.includes('onboarding.write'), false);
  });

  await withOnboardingFile({ initial: { 'guild-1': {} } }, async ({ log }) => {
    const roadmap = createTextChannel({ id: 'roadmap-channel', name: concierge.ROADMAP_CHANNEL_NAME, parentId: 'category-existing', log, behavior: { sendFails: true }, label: 'roadmap' });
    const guild = createGuild({ guideName: concierge.GUIDE_CHANNEL_NAME, roadmapName: concierge.ROADMAP_CHANNEL_NAME, log, behavior: { categoryExists: true }, existingRoadmap: roadmap });
    await assert.rejects(() => concierge.setupRoadmapPanel(guild), /roadmap send failure/);
    assert.equal(log.calls.includes('onboarding.write'), false);
  });
  console.log('Community Guide partial-failure baseline tests passed.');
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
