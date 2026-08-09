const assert = require('node:assert/strict');
const { withCommunityRoadmapLookupRuntime, createCompatiblePair } = require('../../helpers/withCommunityRoadmapLookupRuntime');

(async () => {
  for (const scenario of [{ roadmapMessageId: 'M' }, { roadmapMessageId: 'missing', fetchResult: null }]) {
    await withCommunityRoadmapLookupRuntime({ ...scenario, createPair: createCompatiblePair }, async ({ concierge, guild, roadmap, log }) => {
      if (scenario.roadmapMessageId === 'M') {
        const message = { id: 'M', async edit() { log.calls.push('roadmap.message.edit'); } };
        roadmap.messages.fetch = async () => { log.calls.push('roadmap.message.fetch'); return message; };
      }
      await concierge.setupRoadmapPanel(guild);
      const lookup = log.calls.indexOf('roadmap.message.fetch');
      const mutation = log.calls.findIndex((call) => call === 'roadmap.message.edit' || call === 'roadmap.message.send');
      const persist = log.calls.indexOf('onboarding.write');
      assert.ok(lookup >= 0 && lookup < mutation && mutation < persist);
    });
  }
  console.log('Roadmap mutation ordering baseline passed');
})().catch((error) => { console.error(error); process.exitCode = 1; });
