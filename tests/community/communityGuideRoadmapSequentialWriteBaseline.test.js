const assert = require('node:assert/strict');
const fixture = require('../fixtures/communityGuideRoadmapPersistenceLegacyBaseline');
const { createCommunityGuideRoadmapPersistenceHarness } = require('../helpers/createCommunityGuideRoadmapPersistenceHarness');
const concierge = require('../../src/systems/communityConcierge');
const { createGuild, createTextChannel, withOnboardingFile } = require('../helpers/createCommunityGuideMutationHarness');

const harness = createCommunityGuideRoadmapPersistenceHarness({ initial: fixture.records.emptyRoot });
harness.patch('guild-1', fixture.patches.guide);
harness.patch('guild-1', fixture.patches.roadmap);
assert.deepEqual(harness.log.calls, ['read', 'write', 'read', 'write']);
assert.equal(harness.getState()['guild-1'].guideMessageId, 'guide-next-message');
assert.equal(harness.getState()['guild-1'].roadmapMessageId, 'roadmap-next-message');

async function characterizeRuntimeSequence() {
  await withOnboardingFile({ initial: { 'guild-1': { unknown: { retained: true } } } }, async ({ log, getState }) => {
    const guide = createTextChannel({ id: 'guide-channel', name: concierge.GUIDE_CHANNEL_NAME, parentId: 'category-existing', log, label: 'guide' });
    const roadmap = createTextChannel({ id: 'roadmap-channel', name: concierge.ROADMAP_CHANNEL_NAME, parentId: 'category-existing', log, label: 'roadmap' });
    const guild = createGuild({ guideName: concierge.GUIDE_CHANNEL_NAME, roadmapName: concierge.ROADMAP_CHANNEL_NAME, log, behavior: { categoryExists: true }, existingGuide: guide, existingRoadmap: roadmap });
    await concierge.setupCommunityGuide(guild, { mode: 'create' });
    await concierge.setupRoadmapPanel(guild);
    const record = getState()['guild-1'];
    assert.equal(record.guideMessageId, 'guide-channel-sent');
    assert.equal(record.roadmapMessageId, 'roadmap-channel-sent');
    assert.deepEqual(record.unknown, { retained: true });
    assert.deepEqual(log.calls.filter((call) => call === 'onboarding.write').length, 2);
  });
}

characterizeRuntimeSequence().then(() => console.log('Community Guide/Roadmap sequential-write baseline tests passed.')).catch((error) => { console.error(error); process.exitCode = 1; });
