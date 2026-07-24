const assert = require('node:assert/strict');
const { createCommunityGuideReadCompatibilityAdapter } = require('../../src/composition/community/createCommunityGuideReadFeature');
const baseline = require('../fixtures/communityGuideLegacyBaseline');

async function main() {
  const payload = await createCommunityGuideReadCompatibilityAdapter({
    guild: baseline.guild,
    guideContentReader: { readGuideContent: async () => baseline.guideContent },
    conciergeTextGenerator: { generate: async (_kind, _context, fallback) => fallback }
  }).buildPayload();
  const embed = payload.embeds[0].toJSON();
  assert.match(embed.timestamp, /^\d{4}-\d{2}-\d{2}T/);
  delete embed.timestamp;
  if (embed.footer?.icon_url === undefined) delete embed.footer.icon_url;
  assert.deepEqual(embed, baseline.embedWithoutTimestamp);
  assert.deepEqual(payload.components.map((row) => row.toJSON()), baseline.componentPayload);
  console.log('Community Guide read migration regression tests passed.');
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
