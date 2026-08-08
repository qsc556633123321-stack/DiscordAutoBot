const assert = require('node:assert/strict');
const path = require('node:path');
const { createGuild, createMessage, createTextChannel, withOnboardingFile } = require('../../helpers/createCommunityGuideMutationHarness');

async function withPairSpy(run) {
  const featurePath = require.resolve('../../../src/composition/communityGuideAdapterPairFeature');
  const runtimePath = require.resolve('../../../src/systems/communityConcierge');
  const originalFeature = require(featurePath);
  const pairs = [];
  require.cache[featurePath].exports = {
    createCommunityGuideAdapterPairFeature() {
      return { createAdapterPair({ ensuredChannel }) { pairs.push(ensuredChannel); return { lookupPort: {}, mutationPort: {} }; } };
    }
  };
  delete require.cache[runtimePath];
  try { return await run({ concierge: require(runtimePath), pairs }); }
  finally {
    delete require.cache[runtimePath];
    require.cache[featurePath].exports = originalFeature;
  }
}

async function runScenario({ mode, trackedMessageId, fetch = 'none', expected }) {
  return withPairSpy(({ concierge, pairs }) => withOnboardingFile({ initial: { 'guild-1': { guideMessageId: trackedMessageId } } }, async ({ log }) => {
    const guide = createTextChannel({ id: 'guide-channel', name: concierge.GUIDE_CHANNEL_NAME, parentId: 'category-existing', log, behavior: { existingMessage: fetch === 'message' ? createMessage('tracked', log) : null, fetchFails: fetch === 'reject' }, label: 'guide' });
    const guild = createGuild({ guideName: concierge.GUIDE_CHANNEL_NAME, roadmapName: concierge.ROADMAP_CHANNEL_NAME, log, behavior: { categoryExists: true }, existingGuide: guide });
    const result = await concierge.setupCommunityGuide(guild, mode === 'normal' ? {} : { mode });
    assert.equal(pairs.length, 1);
    assert.equal(pairs[0], guide);
    assert.equal(log.calls.includes(expected), true);
    return { log, result, pairs };
  }));
}

(async () => {
  const edit = await runScenario({ mode: 'normal', trackedMessageId: 'tracked', fetch: 'message', expected: 'guide.message.edit' });
  assert.equal(edit.log.calls.filter((call) => call === 'guide.message.fetch').length, 1);
  assert.equal(edit.log.calls.filter((call) => call === 'guide.message.send').length, 0);
  const force = await runScenario({ mode: 'force', trackedMessageId: 'tracked', fetch: 'message', expected: 'guide.message.send' });
  assert.equal(force.log.calls.filter((call) => call === 'guide.message.fetch').length, 0);
  const missing = await runScenario({ mode: 'normal', trackedMessageId: null, expected: 'guide.message.send' });
  assert.equal(missing.log.calls.filter((call) => call === 'guide.message.fetch').length, 0);
  const unavailable = await runScenario({ mode: 'normal', trackedMessageId: 'tracked', fetch: 'reject', expected: 'guide.message.send' });
  assert.equal(unavailable.log.calls.filter((call) => call === 'guide.message.fetch').length, 1);
  console.log('Community guide runtime pair creation implementation passed');
})().catch((error) => { console.error(error); process.exitCode = 1; });
