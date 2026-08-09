const assert = require('node:assert/strict');
const { withCommunityRoadmapLookupRuntime } = require('../../helpers/withCommunityRoadmapLookupRuntime');

async function withPersistenceFailure(persist, run) {
  const featurePath = require.resolve('../../../src/composition/communityRoadmapPersistenceFeature');
  const runtimePath = require.resolve('../../../src/systems/communityConcierge');
  const original = require(featurePath);
  require.cache[featurePath].exports = { createCommunityRoadmapPersistenceFeature: () => ({ persist }) };
  delete require.cache[runtimePath];
  try { await run(); } finally {
    delete require.cache[runtimePath];
    require.cache[featurePath].exports = original;
  }
}

(async () => {
  await withCommunityRoadmapLookupRuntime({ roadmapMessageId: 'missing', rejection: new Error('lookup reject') }, async ({ concierge, guild, roadmap, log }) => {
    const sent = { id: 'S' };
    roadmap.send = async () => { log.calls.push('roadmap.message.send'); return sent; };
    const result = await concierge.setupRoadmapPanel(guild);
    assert.strictEqual(result.message, sent);
    assert.equal(log.calls.filter((call) => call === 'roadmap.message.fetch').length, 1);
    assert.equal(log.calls.filter((call) => call === 'roadmap.message.send').length, 1);
  });

  for (const branch of ['edit', 'send']) {
    const failure = branch === 'edit' ? new Error('edit reject') : undefined;
    await withCommunityRoadmapLookupRuntime({ roadmapMessageId: branch === 'edit' ? 'M' : 'missing' }, async ({ concierge, guild, roadmap, log }) => {
      if (branch === 'edit') roadmap.messages.fetch = async () => ({ id: 'M', async edit() { log.calls.push('roadmap.message.edit'); throw failure; } });
      else {
        roadmap.messages.fetch = async () => null;
        roadmap.send = async () => { log.calls.push('roadmap.message.send'); throw failure; };
      }
      let caught = Symbol('not thrown');
      try { await concierge.setupRoadmapPanel(guild); } catch (error) { caught = error; }
      assert.strictEqual(caught, failure);
      assert.equal(log.calls.filter((call) => call === `roadmap.message.${branch}`).length, 1);
      assert.equal(log.calls.filter((call) => call === 'onboarding.write').length, 0);
    });
  }

  await withCommunityRoadmapLookupRuntime({ roadmapMessageId: 'M', writeFails: true }, async ({ concierge, guild, roadmap, log }) => {
    const message = { id: 'M', async edit() { log.calls.push('roadmap.message.edit'); return this; } };
    roadmap.messages.fetch = async () => message;
    const result = await concierge.setupRoadmapPanel(guild);
    assert.strictEqual(result.message, message);
    assert.equal(log.calls.filter((call) => call === 'roadmap.message.edit').length, 1);
    assert.equal(log.calls.filter((call) => call === 'onboarding.write').length, 1);
  });

  for (const failure of [new Error('invariant'), 'invariant', 7, { failure: true }, null, undefined]) {
    let persistCalls = 0;
    await withPersistenceFailure(() => { persistCalls += 1; throw failure; }, async () => {
      await withCommunityRoadmapLookupRuntime({ roadmapMessageId: 'M' }, async ({ concierge, guild, roadmap, log }) => {
        roadmap.messages.fetch = async () => ({ id: 'M', async edit() { log.calls.push('roadmap.message.edit'); return this; } });
        let caught = Symbol('not thrown');
        try { await concierge.setupRoadmapPanel(guild); } catch (error) { caught = error; }
        assert.strictEqual(caught, failure);
        assert.equal(persistCalls, 1);
        assert.equal(log.calls.filter((call) => call === 'roadmap.message.edit').length, 1);
        assert.equal(log.calls.filter((call) => call === 'roadmap.message.send').length, 0);
      });
    });
  }
  console.log('Roadmap end-to-end failure closure preserves lookup swallow, mutation identity, and partial success.');
})().catch((error) => { console.error(error); process.exitCode = 1; });
