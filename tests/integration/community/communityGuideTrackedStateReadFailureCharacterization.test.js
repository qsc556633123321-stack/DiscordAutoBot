const assert = require('node:assert/strict');
const { createGuild, createTextChannel, withOnboardingFile } = require('../../helpers/createCommunityGuideMutationHarness');

async function verify(options) {
  const concierge = require('../../../src/systems/communityConcierge');
  await withOnboardingFile(options, async ({ log }) => {
    const guide = createTextChannel({ id: 'guide-channel', name: concierge.GUIDE_CHANNEL_NAME, parentId: 'category-existing', log, label: 'guide' });
    const guild = createGuild({ guideName: concierge.GUIDE_CHANNEL_NAME, roadmapName: concierge.ROADMAP_CHANNEL_NAME, log, behavior: { categoryExists: true }, existingGuide: guide });
    const result = await concierge.setupCommunityGuide(guild, { mode: 'refresh' });
    assert.equal(result.message.id, 'guide-channel-sent');
    assert.equal(log.calls.filter((call) => call === 'guide.message.fetch').length, 0);
    assert.equal(log.calls.filter((call) => call === 'guide.message.send').length, 1);
    assert.ok(log.errors.length >= 1);
  });
}

(async () => {
  await verify({ raw: '{not-json' });
  await verify({ readFails: true });
  console.log('Guide tracked-state malformed JSON and read failures preserve the empty-state Send fallback.');
})().catch((error) => { console.error(error); process.exitCode = 1; });
