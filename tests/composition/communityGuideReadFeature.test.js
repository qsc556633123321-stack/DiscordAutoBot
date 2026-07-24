const assert = require('node:assert/strict');
const { createCommunityGuideReadCompatibilityAdapter, createCommunityGuideReadFeature } = require('../../src/composition/community/createCommunityGuideReadFeature');
const baseline = require('../fixtures/communityGuideLegacyBaseline');

async function main() {
  const dependencies = {
    guild: { id: 'guild-1', name: 'Test Guild' },
    guideContentReader: { readGuideContent: async () => baseline.guideContent },
    guideStatusReader: { readGuideStatus: async () => baseline.statusRecord },
    guideGuildFactsReader: { readGuideGuildFacts: async () => baseline.guildFacts },
    conciergeTextGenerator: { generate: async (_kind, _context, fallback) => fallback }
  };
  const feature = createCommunityGuideReadFeature(dependencies);
  assert.deepEqual((await feature.getCommunityGuide.execute({ guildId: 'guild-1', guildName: 'Test Guild' })).guide, baseline.guideViewModel);
  assert.deepEqual((await feature.getCommunityGuideStatus.execute({ guildId: 'guild-1' })).status, baseline.statusViewModel);
  assert.equal((await createCommunityGuideReadCompatibilityAdapter(dependencies).buildPayload()).embeds.length, 1);
  console.log('Community Guide read composition tests passed.');
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
