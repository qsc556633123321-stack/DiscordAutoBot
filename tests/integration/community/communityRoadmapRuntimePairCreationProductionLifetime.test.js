const assert = require('node:assert/strict');
const { createGuild, createTextChannel, withOnboardingFile } = require('../../helpers/createCommunityGuideMutationHarness');

(async () => {
  const featurePath = require.resolve('../../../src/composition/communityRoadmapAdapterPairFeature');
  const runtimePath = require.resolve('../../../src/systems/communityConcierge');
  const original = require(featurePath);
  const pairs = [];
  let featureCreations = 0;
  require.cache[featurePath].exports = {
    createCommunityRoadmapAdapterPairFeature() {
      featureCreations += 1;
      return {
        createAdapterPair(input) {
          const pair = { input };
          pairs.push(pair);
          return {
            lookupPort: { async lookupTrackedMessage() { return { kind: 'Unavailable' }; } },
            getRetainedMessage() { return null; }
          };
        }
      };
    }
  };
  delete require.cache[runtimePath];
  try {
    await withOnboardingFile({ initial: { 'guild-1': {} } }, async ({ log }) => {
      const concierge = require(runtimePath);
      const roadmap = createTextChannel({ id: 'roadmap', name: concierge.ROADMAP_CHANNEL_NAME, parentId: 'category', log, label: 'roadmap' });
      const guild = createGuild({ guideName: concierge.GUIDE_CHANNEL_NAME, roadmapName: concierge.ROADMAP_CHANNEL_NAME, log, behavior: { categoryExists: true }, existingRoadmap: roadmap });
      await concierge.setupRoadmapPanel(guild);
      await concierge.setupRoadmapPanel(guild);
      assert.equal(featureCreations, 1);
      assert.equal(pairs.length, 2);
      assert.notStrictEqual(pairs[0], pairs[1]);
      assert.strictEqual(pairs[0].input.ensuredChannel, roadmap);
      assert.strictEqual(pairs[1].input.ensuredChannel, roadmap);
    });
  } finally {
    delete require.cache[runtimePath];
    require.cache[featurePath].exports = original;
  }
  console.log('Roadmap runtime production Pair lifetime passed');
})().catch((error) => { console.error(error); process.exitCode = 1; });
