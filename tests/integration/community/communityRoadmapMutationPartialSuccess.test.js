const assert = require('node:assert/strict');
const { withCommunityRoadmapLookupRuntime, createCompatiblePair } = require('../../helpers/withCommunityRoadmapLookupRuntime');

(async () => {
  await withCommunityRoadmapLookupRuntime({ roadmapMessageId: 'M', createPair: createCompatiblePair, writeFails: true }, async ({ concierge, guild, roadmap, log }) => {
    let edits = 0;
    const message = { id: 'M', async edit() { edits += 1; } };
    roadmap.messages.fetch = async () => { log.calls.push('roadmap.message.fetch'); return message; };
    const result = await concierge.setupRoadmapPanel(guild);
    assert.strictEqual(result.message, message);
    assert.equal(edits, 1);
    assert.equal(log.calls.filter((call) => call === 'roadmap.message.send').length, 0);
    assert.equal(log.writes, 1);
    assert.ok(log.errors.some((line) => line.includes('onboarding write failure')));
  });
  await withCommunityRoadmapLookupRuntime({ roadmapMessageId: 'missing', fetchResult: null, createPair: createCompatiblePair, writeFails: true }, async ({ concierge, guild, log }) => {
    const result = await concierge.setupRoadmapPanel(guild);
    assert.equal(result.message.id, 'roadmap-channel-sent');
    assert.equal(log.calls.filter((call) => call === 'roadmap.message.send').length, 1);
    assert.equal(log.writes, 1);
    assert.ok(log.errors.some((line) => line.includes('onboarding write failure')));
  });
  console.log('Roadmap mutation partial-success semantics passed with legacy persistence failure swallowing');
})().catch((error) => { console.error(error); process.exitCode = 1; });
