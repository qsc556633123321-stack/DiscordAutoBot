const assert = require('node:assert/strict');
const { withCommunityRoadmapLookupRuntime } = require('../../helpers/withCommunityRoadmapLookupRuntime');

async function withPersistenceFeature(persist, run) {
  const featurePath = require.resolve('../../../src/composition/communityRoadmapPersistenceFeature');
  const runtimePath = require.resolve('../../../src/systems/communityConcierge');
  const original = require(featurePath);
  require.cache[featurePath].exports = {
    createCommunityRoadmapPersistenceFeature() {
      return { persist };
    }
  };
  delete require.cache[runtimePath];
  try {
    await run();
  } finally {
    delete require.cache[runtimePath];
    require.cache[featurePath].exports = original;
  }
}

(async () => {
  await withCommunityRoadmapLookupRuntime({ roadmapMessageId: 'edit-message', writeFails: true }, async ({ concierge, guild, roadmap, log }) => {
    const message = { id: 'edit-message', async edit() { log.calls.push('roadmap.message.edit'); return this; } };
    roadmap.messages.fetch = async () => message;
    const result = await concierge.setupRoadmapPanel(guild);
    assert.strictEqual(result.message, message);
    assert.equal(log.calls.filter((call) => call === 'roadmap.message.edit').length, 1);
    assert.equal(log.calls.filter((call) => call === 'onboarding.write').length, 1);
  });

  for (const failure of [new Error('invariant'), 'invariant', 7, { failure: true }, null, undefined]) {
    let calls = 0;
    await withPersistenceFeature(() => {
      calls += 1;
      throw failure;
    }, async () => {
      await withCommunityRoadmapLookupRuntime({ roadmapMessageId: 'edit-message' }, async ({ concierge, guild, roadmap, log }) => {
        const message = { id: 'edit-message', async edit() { log.calls.push('roadmap.message.edit'); return this; } };
        roadmap.messages.fetch = async () => message;
        let caught = Symbol('not-thrown');
        try {
          await concierge.setupRoadmapPanel(guild);
        } catch (error) {
          caught = error;
        }
        assert.strictEqual(caught, failure);
        assert.equal(calls, 1);
        assert.equal(log.calls.filter((call) => call === 'roadmap.message.edit').length, 1);
        assert.equal(log.calls.filter((call) => call === 'roadmap.message.send').length, 0);
      });
    });
  }

  console.log('Roadmap runtime redirect preserves writer partial success and raw invariant failure identity.');
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
