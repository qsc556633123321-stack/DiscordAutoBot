const assert = require('node:assert/strict');
const cases = require('../../fixtures/community/community-roadmap-mutation-boundary-cases.json');
const { withCommunityRoadmapLookupRuntime, createCompatiblePair } = require('../../helpers/withCommunityRoadmapLookupRuntime');

(async () => {
  assert.equal(cases.cases.length, 60);
  await withCommunityRoadmapLookupRuntime({ roadmapMessageId: 'M', createPair: createCompatiblePair }, async ({ concierge, guild, roadmap, log, getState }) => {
    const message = { id: 'M', async edit(payload) { log.editCalls = (log.editCalls || 0) + 1; log.editReceiver = this; log.editPayload = payload; return { id: 'different' }; } };
    roadmap.messages.fetch = async () => { log.calls.push('roadmap.message.fetch'); return message; };
    const result = await concierge.setupRoadmapPanel(guild);
    assert.strictEqual(result.message, message);
    assert.strictEqual(log.editReceiver, message);
    assert.equal(log.editCalls, 1);
    assert.equal(log.calls.filter((call) => call === 'roadmap.message.send').length, 0);
    assert.equal(getState()['guild-1'].roadmapMessageId, 'M');
  });
  await withCommunityRoadmapLookupRuntime({ roadmapMessageId: 'missing', fetchResult: null, createPair: createCompatiblePair }, async ({ concierge, guild, log, getState }) => {
    const result = await concierge.setupRoadmapPanel(guild);
    assert.equal(log.calls.filter((call) => call === 'roadmap.message.send').length, 1);
    assert.equal(log.calls.filter((call) => call === 'roadmap.message.edit').length, 0);
    assert.equal(getState()['guild-1'].roadmapMessageId, result.message.id);
  });
  console.log('Roadmap legacy mutation characterization passed');
})().catch((error) => { console.error(error); process.exitCode = 1; });
