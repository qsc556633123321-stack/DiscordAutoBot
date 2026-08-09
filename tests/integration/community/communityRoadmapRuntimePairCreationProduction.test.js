const assert = require('node:assert/strict');
const { createGuild, createMessage, createTextChannel, withOnboardingFile } = require('../../helpers/createCommunityGuideMutationHarness');

async function withRoadmapPair(run) {
  const featurePath = require.resolve('../../../src/composition/communityRoadmapAdapterPairFeature');
  const runtimePath = require.resolve('../../../src/systems/communityConcierge');
  const originalFeature = require(featurePath);
  const metrics = { featureCreations: 0, pairInputs: [], pairs: [], lookupCalls: 0, getterCalls: 0 };
  require.cache[featurePath].exports = {
    createCommunityRoadmapAdapterPairFeature() {
      metrics.featureCreations += 1;
      return {
        createAdapterPair(input) {
          const pair = { input };
          metrics.pairInputs.push(input);
          metrics.pairs.push(pair);
          let retainedMessage = null;
          return {
            lookupPort: {
              async lookupTrackedMessage({ messageId }) {
                metrics.lookupCalls += 1;
                try {
                  retainedMessage = await input.ensuredChannel.messages.fetch(messageId);
                  return retainedMessage ? { kind: 'Available', messageId } : { kind: 'Unavailable' };
                } catch (_) {
                  retainedMessage = null;
                  return { kind: 'Unavailable' };
                }
              }
            },
            getRetainedMessage() { metrics.getterCalls += 1; return retainedMessage; }
          };
        }
      };
    }
  };
  delete require.cache[runtimePath];
  try {
    return await run({ concierge: require(runtimePath), metrics });
  } finally {
    delete require.cache[runtimePath];
    require.cache[featurePath].exports = originalFeature;
  }
}

async function capture({ roadmapMessageId, existingMessage, fetchFails = false }) {
  return withRoadmapPair(({ concierge, metrics }) => withOnboardingFile({
    initial: { 'guild-1': roadmapMessageId === undefined ? {} : { roadmapMessageId } }
  }, async ({ log, getState }) => {
    const tracked = existingMessage ? createMessage(roadmapMessageId, log, {}, 'roadmap') : null;
    const roadmap = createTextChannel({
      id: 'roadmap-channel', name: concierge.ROADMAP_CHANNEL_NAME, parentId: 'category-existing', log, label: 'roadmap',
      behavior: { existingMessage: tracked, fetchFails }
    });
    const fetch = roadmap.messages.fetch;
    roadmap.messages.fetch = async (...args) => {
      log.fetchArgs = args;
      return fetch(...args);
    };
    const guild = createGuild({
      guideName: concierge.GUIDE_CHANNEL_NAME, roadmapName: concierge.ROADMAP_CHANNEL_NAME,
      log, behavior: { categoryExists: true }, existingRoadmap: roadmap
    });
    const result = await concierge.setupRoadmapPanel(guild);
    return { result, metrics, log, state: getState(), roadmap };
  }));
}

(async () => {
  const existing = await capture({ roadmapMessageId: 'tracked', existingMessage: true });
  assert.equal(existing.metrics.featureCreations, 1);
  assert.equal(existing.metrics.pairs.length, 1);
  assert.strictEqual(existing.metrics.pairInputs[0].ensuredChannel, existing.roadmap);
  assert.equal(existing.metrics.lookupCalls, 1);
  assert.equal(existing.metrics.getterCalls, 1);
  assert.deepEqual(existing.log.fetchArgs, ['tracked']);
  assert.equal(existing.log.calls.filter((call) => call === 'roadmap.message.fetch').length, 1);
  assert.equal(existing.log.calls.filter((call) => call === 'roadmap.message.edit').length, 1);
  assert.equal(existing.log.calls.filter((call) => call === 'roadmap.message.send').length, 0);
  assert.equal(existing.log.writes, 1);
  assert.deepEqual(Object.keys(existing.result).sort(), ['channel', 'message']);
  assert.strictEqual(existing.result.channel, existing.roadmap);
  assert.equal(existing.result.message.id, 'tracked');
  assert.equal(existing.state['guild-1'].roadmapMessageId, 'tracked');

  for (const roadmapMessageId of [undefined, null, '', 0, false]) {
    const missing = await capture({ roadmapMessageId, existingMessage: false });
    assert.equal(missing.metrics.pairs.length, 1);
    assert.equal(missing.metrics.lookupCalls, 0);
    assert.equal(missing.metrics.getterCalls, 0);
    assert.equal(missing.log.calls.filter((call) => call === 'roadmap.message.fetch').length, 0);
    assert.equal(missing.log.calls.filter((call) => call === 'roadmap.message.edit').length, 0);
    assert.equal(missing.log.calls.filter((call) => call === 'roadmap.message.send').length, 1);
    assert.equal(missing.log.writes, 1);
    assert.deepEqual(Object.keys(missing.result).sort(), ['channel', 'message']);
  }

  const rejected = await capture({ roadmapMessageId: 'rejected', fetchFails: true });
  assert.equal(rejected.log.calls.filter((call) => call === 'roadmap.message.fetch').length, 1);
  assert.equal(rejected.log.calls.filter((call) => call === 'roadmap.message.send').length, 1);
  assert.equal(rejected.log.calls.filter((call) => call === 'roadmap.message.edit').length, 0);
  assert.equal(rejected.metrics.lookupCalls, 1);
  assert.equal(rejected.metrics.getterCalls, 0);
  console.log('Roadmap runtime Pair creation production integration passed');
})().catch((error) => { console.error(error); process.exitCode = 1; });
