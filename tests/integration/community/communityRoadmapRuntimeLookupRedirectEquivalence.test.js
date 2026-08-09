const assert = require('node:assert/strict');
const cases = require('../../fixtures/community/community-roadmap-runtime-lookup-redirect-cases.json');
const { createFakeCommunityRoadmapRuntimeLookupRedirect } = require('../../fakes/community/FakeCommunityRoadmapRuntimeLookupRedirect');

function createHarness(input = {}) {
  const { messageId, fetchResult, rejection } = input;
  const log = { fetches: [], edits: [], sends: [], saves: [] };
  const existing = fetchResult === undefined ? {
    id: 'existing-message',
    async edit(payload) { log.edits.push({ receiver: this, payload }); }
  } : fetchResult;
  const sent = { id: 'sent-message', async edit() {} };
  const channel = {
    id: 'roadmap-channel',
    messages: {
      async fetch(id) {
        log.fetches.push(id);
        if (Object.prototype.hasOwnProperty.call(input, 'rejection')) throw rejection;
        return existing;
      }
    },
    async send(payload) { log.sends.push(payload); return sent; }
  };
  const shared = {
    getOrCreateRoadmapChannel: async () => channel,
    readOnboardingData: () => ({ guild: messageId === undefined ? {} : { roadmapMessageId: messageId } }),
    fromLegacyPublicationRecord: (_id, data) => ({ roadmap: { messageId: data.roadmapMessageId } }),
    buildRoadmapEmbed: () => ({ title: 'Roadmap' }),
    saveOnboarding: (guildId, patch) => log.saves.push({ guildId, patch })
  };
  async function legacy() {
    const ensured = await shared.getOrCreateRoadmapChannel();
    const data = shared.readOnboardingData().guild || {};
    const state = shared.fromLegacyPublicationRecord('guild', data);
    const id = state.roadmap.messageId || data.roadmapMessageId;
    const payload = { embeds: [shared.buildRoadmapEmbed()] };
    let message = id ? await ensured.messages.fetch(id).catch(() => null) : null;
    if (message) await message.edit(payload); else message = await ensured.send(payload);
    shared.saveOnboarding('guild', { roadmapChannelId: ensured.id, roadmapMessageId: message.id });
    return { channel: ensured, message };
  }
  return { log, channel, legacy, candidate: createFakeCommunityRoadmapRuntimeLookupRedirect(shared) };
}

(async () => {
  assert.equal(cases.cases.length, 50);
  const scenarios = [
    { messageId: undefined }, { messageId: null }, { messageId: '' }, { messageId: 0 }, { messageId: false },
    { messageId: 'tracked' }, { messageId: 'tracked', fetchResult: null }, { messageId: 'tracked', fetchResult: undefined },
    { messageId: 'tracked', fetchResult: false }, { messageId: '   ' }, { messageId: 42 }, { messageId: true }, { messageId: { bad: true } },
    ...[new Error('error'), 'string', 7, { bad: true }, null, undefined].map((rejection) => ({ messageId: 'tracked', rejection }))
  ];
  for (const scenario of scenarios) {
    const legacy = createHarness(scenario);
    const candidate = createHarness(scenario);
    const legacyResult = await legacy.legacy();
    const candidateResult = await candidate.candidate.setupRoadmapPanel({ id: 'guild' });
    assert.equal(candidateResult.channel.id, legacyResult.channel.id);
    assert.equal(candidateResult.message.id, legacyResult.message.id);
    assert.deepEqual(candidate.log.fetches, legacy.log.fetches);
    assert.deepEqual(candidate.log.edits.map(({ payload }) => payload), legacy.log.edits.map(({ payload }) => payload));
    assert.deepEqual(candidate.log.sends, legacy.log.sends);
    assert.deepEqual(candidate.log.saves, legacy.log.saves);
  }
  console.log('Roadmap runtime lookup redirect candidate matches legacy branches');
})().catch((error) => { console.error(error); process.exitCode = 1; });
