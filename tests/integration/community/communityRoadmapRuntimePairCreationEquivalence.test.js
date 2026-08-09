const assert = require('node:assert/strict');
const cases = require('../../fixtures/community/community-roadmap-runtime-pair-creation-cases.json');
const { createFakeCommunityRoadmapRuntimeWithUnusedPair } = require('../../fakes/community/FakeCommunityRoadmapRuntimeWithUnusedPair');

function createHarness({ messageId, fetchResult, fetchError } = {}) {
  const log = { fetches: [], edits: [], sends: [], saves: [], pairInputs: [], lookupCalls: 0, getterCalls: 0 };
  const message = fetchResult === undefined ? { id: 'existing', async edit(payload) { log.edits.push(payload); } } : fetchResult;
  const channel = {
    id: 'roadmap-channel',
    messages: {
      async fetch(id) {
        log.fetches.push(id);
        if (fetchError) throw fetchError;
        return message;
      }
    },
    async send(payload) { log.sends.push(payload); return { id: 'sent' }; }
  };
  const shared = {
    getOrCreateRoadmapChannel: async () => channel,
    readOnboardingData: () => ({ guild: messageId === undefined ? {} : { roadmapMessageId: messageId } }),
    fromLegacyPublicationRecord: (_guildId, data) => ({ roadmap: { messageId: data.roadmapMessageId } }),
    buildRoadmapEmbed: () => ({ title: 'Roadmap' }),
    saveOnboarding: (guildId, patch) => log.saves.push({ guildId, patch })
  };
  const legacy = async () => {
    const ensured = await shared.getOrCreateRoadmapChannel();
    const data = shared.readOnboardingData().guild || {};
    const state = shared.fromLegacyPublicationRecord('guild', data);
    const id = state.roadmap.messageId || data.roadmapMessageId;
    const payload = { embeds: [shared.buildRoadmapEmbed()] };
    let result = id ? await ensured.messages.fetch(id).catch(() => null) : null;
    if (result) await result.edit(payload); else result = await ensured.send(payload);
    shared.saveOnboarding('guild', { roadmapChannelId: ensured.id, roadmapMessageId: result.id });
    return { channel: ensured, message: result };
  };
  const candidate = createFakeCommunityRoadmapRuntimeWithUnusedPair({
    ...shared,
    createFeature: () => ({
      createAdapterPair(input) {
        log.pairInputs.push(input);
        return {
          lookupPort: { lookupTrackedMessage() { log.lookupCalls += 1; } },
          getRetainedMessage() { log.getterCalls += 1; }
        };
      }
    })
  });
  return { log, channel, legacy, candidate };
}

(async () => {
  assert.equal(cases.cases.length, 40);
  for (const scenario of [
    { messageId: undefined }, { messageId: '' }, { messageId: 0 }, { messageId: false },
    { messageId: 'tracked' }, { messageId: 'tracked', fetchResult: null },
    { messageId: 'tracked', fetchError: new Error('fetch failed') }
  ]) {
    const legacyHarness = createHarness(scenario);
    const candidateHarness = createHarness(scenario);
    const legacyResult = await legacyHarness.legacy();
    const candidateResult = await candidateHarness.candidate.setupRoadmapPanel({ id: 'guild' });
    assert.deepEqual(
      { channelId: candidateResult.channel.id, messageId: candidateResult.message.id },
      { channelId: legacyResult.channel.id, messageId: legacyResult.message.id }
    );
    assert.strictEqual(candidateResult.channel, candidateHarness.channel);
    assert.deepEqual(candidateHarness.log.fetches, legacyHarness.log.fetches);
    assert.deepEqual(candidateHarness.log.edits, legacyHarness.log.edits);
    assert.deepEqual(candidateHarness.log.sends, legacyHarness.log.sends);
    assert.deepEqual(candidateHarness.log.saves, legacyHarness.log.saves);
    assert.strictEqual(candidateHarness.log.pairInputs[0].ensuredChannel, candidateHarness.channel);
    assert.equal(candidateHarness.log.lookupCalls, 0);
    assert.equal(candidateHarness.log.getterCalls, 0);
  }

  const pairFailure = new Error('pair creation failed');
  const failureHarness = createHarness({ messageId: 'tracked' });
  const failureRuntime = createFakeCommunityRoadmapRuntimeWithUnusedPair({
    getOrCreateRoadmapChannel: async () => failureHarness.channel,
    readOnboardingData: () => ({ guild: { roadmapMessageId: 'tracked' } }),
    fromLegacyPublicationRecord: () => ({ roadmap: { messageId: 'tracked' } }),
    buildRoadmapEmbed: () => ({ title: 'Roadmap' }),
    saveOnboarding: (guildId, patch) => failureHarness.log.saves.push({ guildId, patch }),
    createFeature: () => ({ createAdapterPair() { throw pairFailure; } })
  });
  await assert.rejects(() => failureRuntime.setupRoadmapPanel({ id: 'guild' }), (error) => error === pairFailure);
  assert.deepEqual(failureHarness.log.fetches, []);
  assert.deepEqual(failureHarness.log.edits, []);
  assert.deepEqual(failureHarness.log.sends, []);
  assert.deepEqual(failureHarness.log.saves, []);
  console.log('Roadmap runtime Pair-created-but-unused equivalence passed');
})().catch((error) => { console.error(error); process.exitCode = 1; });
