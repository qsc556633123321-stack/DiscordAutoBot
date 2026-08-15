const assert = require('node:assert/strict');
const { createGuild, createTextChannel, withOnboardingFile } = require('../../helpers/createCommunityGuideMutationHarness');

async function withDefaultPathConstruction(run) {
  const genericPath = require.resolve('../../../src/composition/communityPublicationStateFeature');
  const runtimePath = require.resolve('../../../src/systems/communityConcierge');
  const original = require(genericPath);
  const calls = [];
  require.cache[genericPath].exports = {
    createCommunityPublicationStateFeature(...args) {
      calls.push(args);
      return original.createCommunityPublicationStateFeature(...args);
    }
  };
  delete require.cache[runtimePath];
  try { await run(require(runtimePath), calls); } finally {
    delete require.cache[runtimePath];
    require.cache[genericPath].exports = original;
  }
}

async function publishBoth(options = {}) {
  await withDefaultPathConstruction(async (concierge, calls) => {
    await withOnboardingFile({ initial: { other: { preserved: true }, 'guild-1': { unknown: true } }, ...options }, async ({ log, getState }) => {
      const guide = createTextChannel({ id: 'guide-channel', name: concierge.GUIDE_CHANNEL_NAME, parentId: 'category-existing', log, label: 'guide' });
      const roadmap = createTextChannel({ id: 'roadmap-channel', name: concierge.ROADMAP_CHANNEL_NAME, parentId: 'category-existing', log, label: 'roadmap' });
      const guild = createGuild({ guideName: concierge.GUIDE_CHANNEL_NAME, roadmapName: concierge.ROADMAP_CHANNEL_NAME, log, behavior: { categoryExists: true }, existingGuide: guide, existingRoadmap: roadmap });
      const guideResult = await concierge.setupCommunityGuide(guild);
      const roadmapResult = await concierge.setupRoadmapPanel(guild);
      assert.equal(calls.length, 2);
      assert.deepEqual(calls, [[], []]);
      assert.equal(guideResult.message.id, 'guide-channel-sent');
      assert.equal(roadmapResult.message.id, 'roadmap-channel-sent');
      assert.equal(log.calls.filter((call) => call === 'onboarding.write').length, options.missingFile ? 3 : 2);
      if (!options.missingFile && !options.raw && !options.readFails && !options.writeFails) {
        assert.equal(getState().other.preserved, true);
        assert.equal(getState()['guild-1'].unknown, true);
      }
      if (!options.readFails && !options.writeFails && !options.raw) {
        assert.equal(getState()['guild-1'].guideMessageId, 'guide-channel-sent');
        assert.equal(getState()['guild-1'].roadmapMessageId, 'roadmap-channel-sent');
      }
    });
  });
}

(async () => {
  await publishBoth();
  await publishBoth({ missingFile: true });
  await publishBoth({ raw: '{bad' });
  await publishBoth({ readFails: true });
  await publishBoth({ writeFails: true });
  console.log('Default-path Guide and Roadmap persistence preserve construction, writes, and root-field behavior.');
})().catch((error) => { console.error(error); process.exitCode = 1; });
