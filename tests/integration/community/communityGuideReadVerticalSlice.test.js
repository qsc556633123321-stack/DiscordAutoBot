const assert = require('node:assert/strict');
const { createCommunityGuideReadCompatibilityAdapter } = require('../../../src/composition/community/createCommunityGuideReadFeature');
const baseline = require('../../fixtures/communityGuideLegacyBaseline');

async function main() {
  const payload = await createCommunityGuideReadCompatibilityAdapter({
    guild: { id: 'guild-1', name: 'Test Guild' },
    guideContentReader: { readGuideContent: async () => baseline.guideContent },
    guideStatusReader: { readGuideStatus: async () => baseline.statusRecord },
    guideGuildFactsReader: { readGuideGuildFacts: async () => baseline.guildFacts },
    conciergeTextGenerator: { generate: async (_kind, _context, fallback) => fallback }
  }).buildPayload();
  const embed = payload.embeds[0].toJSON();
  delete embed.timestamp;
  if (embed.footer?.icon_url === undefined) delete embed.footer.icon_url;
  assert.deepEqual(embed, baseline.embedWithoutTimestamp);
  assert.deepEqual(payload.components.map((row) => row.toJSON()), baseline.componentPayload);
  console.log('Community Guide read vertical-slice tests passed.');
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
