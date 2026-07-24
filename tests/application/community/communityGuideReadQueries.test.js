const assert = require('node:assert/strict');
const { createGetCommunityGuide } = require('../../../src/application/community/getCommunityGuide');
const { createGetCommunityGuideStatus } = require('../../../src/application/community/getCommunityGuideStatus');
const baseline = require('../../fixtures/communityGuideLegacyBaseline');

async function main() {
  const calls = [];
  const factsReader = { readGuideGuildFacts: async (id) => { calls.push(['facts', id]); return baseline.guildFacts; } };
  const contentReader = { readGuideContent: async () => baseline.guideContent };
  const textGenerator = { generate: async (kind, context, fallback) => { calls.push(['text', kind, context, fallback]); return fallback; } };
  const guide = await createGetCommunityGuide({ guideContentReader: contentReader, guideGuildFactsReader: factsReader, conciergeTextGenerator: textGenerator }).execute({ guildId: 'guild-1', guildName: 'Test Guild' });
  assert.deepEqual(guide.guide, baseline.guideViewModel);
  assert.deepEqual(calls, [['facts', 'guild-1'], ['text', 'main_guide', { guildName: 'Test Guild' }, baseline.guideContent.fallbackIntro]]);
  const status = await createGetCommunityGuideStatus({ guideStatusReader: { readGuideStatus: async () => baseline.statusRecord }, guideGuildFactsReader: factsReader }).execute({ guildId: 'guild-1' });
  assert.deepEqual(status.status, baseline.statusViewModel);
  console.log('Community Guide read-query application tests passed.');
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
