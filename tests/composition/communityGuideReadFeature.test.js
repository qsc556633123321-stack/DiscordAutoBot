const assert = require('node:assert/strict');
const { createCommunityGuideReadCompatibilityAdapter, createCommunityGuideReadFeature } = require('../../src/composition/community/createCommunityGuideReadFeature');
const baseline = require('../fixtures/communityGuideLegacyBaseline');

async function main() {
  const dependencies = {
    guideContentReader: { readGuideContent: async () => baseline.guideContent },
    conciergeTextGenerator: { generate: async (_kind, _context, fallback) => fallback }
  };
  const feature = createCommunityGuideReadFeature(dependencies);
  assert.deepEqual((await feature.getCommunityGuide.execute({ guildName: baseline.guild.name })).guide, baseline.guideViewModel);
  assert.equal((await createCommunityGuideReadCompatibilityAdapter({ ...dependencies, guild: baseline.guild }).buildPayload()).embeds.length, 1);
  console.log('Community Guide read composition tests passed.');
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
