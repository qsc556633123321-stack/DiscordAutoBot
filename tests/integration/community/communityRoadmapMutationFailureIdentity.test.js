const assert = require('node:assert/strict');
const { withCommunityRoadmapLookupRuntime, createCompatiblePair } = require('../../helpers/withCommunityRoadmapLookupRuntime');

(async () => {
  for (const failure of [new Error('edit'), 'edit', 1, { edit: true }, null, undefined]) {
    await withCommunityRoadmapLookupRuntime({ roadmapMessageId: 'M', createPair: createCompatiblePair }, async ({ concierge, guild, roadmap, log }) => {
      const message = { id: 'M', async edit() { throw failure; } };
      roadmap.messages.fetch = async () => { log.calls.push('roadmap.message.fetch'); return message; };
      await assert.rejects(() => concierge.setupRoadmapPanel(guild), (error) => error === failure);
      assert.equal(log.calls.filter((call) => call === 'roadmap.message.send').length, 0);
      assert.equal(log.writes, 0);
    });
  }
  for (const failure of [new Error('send'), 'send', 2, { send: true }, null, undefined]) {
    await withCommunityRoadmapLookupRuntime({ roadmapMessageId: 'missing', fetchResult: null, createPair: createCompatiblePair }, async ({ concierge, guild, roadmap, log }) => {
      roadmap.send = async () => { throw failure; };
      await assert.rejects(() => concierge.setupRoadmapPanel(guild), (error) => error === failure);
      assert.equal(log.writes, 0);
    });
  }
  console.log('Roadmap mutation failure identity and no-retry baseline passed');
})().catch((error) => { console.error(error); process.exitCode = 1; });
