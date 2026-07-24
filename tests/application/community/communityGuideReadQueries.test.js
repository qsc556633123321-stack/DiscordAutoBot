const assert = require('node:assert/strict');
const { createGetCommunityGuide } = require('../../../src/application/community/getCommunityGuide');
const baseline = require('../../fixtures/communityGuideLegacyBaseline');

async function main() {
  const calls = [];
  const contentReader = { readGuideContent: async () => baseline.guideContent };
  const textGenerator = { generate: async (kind, context, fallback) => { calls.push(['text', kind, context, fallback]); return fallback; } };
  const guide = await createGetCommunityGuide({ guideContentReader: contentReader, conciergeTextGenerator: textGenerator }).execute({ guildName: baseline.guild.name });
  assert.deepEqual(guide.guide, baseline.guideViewModel);
  assert.deepEqual(calls, [['text', 'main_guide', { guildName: 'Test Guild' }, baseline.guideContent.fallbackIntro]]);
  console.log('Community Guide read-query application tests passed.');
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
