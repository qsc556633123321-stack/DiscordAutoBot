const assert = require('node:assert/strict');
const { concierge, createGuild, createRoadmapChannel, withOnboardingFile } = require('../../helpers/createCommunityRoadmapContinuationHarness');
const { createTextChannel } = require('../../helpers/createCommunityGuideMutationHarness');

async function main() {
  await withOnboardingFile({ initial: { 'guild-1': {} } }, async ({ log, getState }) => {
    const guide = createTextChannel({ id: 'guide-channel', name: concierge.GUIDE_CHANNEL_NAME, parentId: 'category-existing', log, label: 'guide' });
    const roadmap = createRoadmapChannel(log, { sendFails: true });
    const guild = createGuild(log, roadmap, { categoryExists: true });
    guild.channels.cache.set(guide.id, guide);
    await concierge.setupCommunityGuide(guild);
    await assert.rejects(() => concierge.setupRoadmapPanel(guild), /roadmap send failure/);
    assert.equal(getState()['guild-1'].guideMessageId, 'guide-channel-sent');
    assert.equal(getState()['guild-1'].roadmapMessageId, undefined);
  });
  console.log('Community Guide/Roadmap partial success characterization passed');
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
