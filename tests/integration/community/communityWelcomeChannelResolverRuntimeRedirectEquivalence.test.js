const assert = require('node:assert/strict');
const cases = require('../../fixtures/community/community-welcome-channel-resolver-runtime-redirect-cases.json');
const { sendWelcomeWithChannelResolver } = require('../../fakes/community/FakeCommunityWelcomeChannelResolverRuntimeRedirect');
const { mapLegacyWelcomeDeliveryRequest, buildCommunityWelcomeMessage } = require('../../../src/application/community');

function createMember({ cacheValue = null, fetchValue = null, fetchRejects = false, fetchError, fallbackValue = null, calls }) {
  const guild = {
    id: 'guild-1', name: 'Resolver Redirect Guild',
    channels: {
      cache: { get(id) { calls.push(['cache', id]); return cacheValue; } },
      async fetch(id) { calls.push(['fetch', id]); if (fetchRejects) throw fetchError; return fetchValue; }
    }
  };
  return {
    guild,
    async send(payload) { calls.push(['send', payload]); },
    findChannelByName(_guild, name) { calls.push(['fallback', name]); return fallbackValue; }
  };
}

async function legacy({ member, trackedChannelId, guideChannelName }) {
  const guideChannel = trackedChannelId
    ? member.guild.channels.cache.get(trackedChannelId) || await member.guild.channels.fetch(trackedChannelId).catch(() => null)
    : member.findChannelByName(member.guild, guideChannelName);
  if (!guideChannel) return;
  const request = mapLegacyWelcomeDeliveryRequest({ guildId: member.guild.id, guideChannelId: guideChannel.id });
  const payload = buildCommunityWelcomeMessage(request, { guildName: member.guild.name });
  await member.send(payload).catch(() => null);
}

async function compare({ trackedChannelId, cacheValue, fetchValue, fetchRejects, fetchError, fallbackValue }) {
  const legacyCalls = [];
  const candidateCalls = [];
  const legacyMember = createMember({ cacheValue, fetchValue, fetchRejects, fetchError, fallbackValue, calls: legacyCalls });
  const candidateMember = createMember({ cacheValue, fetchValue, fetchRejects, fetchError, fallbackValue, calls: candidateCalls });
  await legacy({ member: legacyMember, trackedChannelId, guideChannelName: 'guide' });
  let reads = 0;
  await sendWelcomeWithChannelResolver({
    member: candidateMember,
    onboardingStateReader: { readOnboardingState() { reads += 1; return { 'guild-1': { guideChannelId: trackedChannelId } }; } },
    findChannelByName: candidateMember.findChannelByName,
    guideChannelName: 'guide'
  });
  assert.equal(reads, 1);
  assert.deepEqual(candidateCalls, legacyCalls);
}

(async () => {
  assert.ok(cases.length >= 50);
  const cached = { id: 'cached' };
  await compare({ trackedChannelId: 'tracked', cacheValue: cached });
  const fetched = { id: 'fetched' };
  await compare({ trackedChannelId: 'tracked', fetchValue: fetched });
  for (const error of [new Error('fetch'), 'fetch', 7, {}, null, undefined]) {
    await compare({ trackedChannelId: 'tracked', fetchRejects: true, fetchError: error });
  }
  const fallback = { id: 'fallback' };
  for (const trackedChannelId of [undefined, null, '', false, 0]) {
    await compare({ trackedChannelId, fallbackValue: fallback });
  }
  for (const trackedChannelId of [123, true, {}, [], '   ']) {
    await compare({ trackedChannelId, fetchValue: fetched });
  }
  await compare({ trackedChannelId: null, fallbackValue: null });
  console.log('Welcome resolver runtime redirect candidate preserves resolution, payload, DM, identity, and one-read behavior.');
})().catch((error) => { console.error(error); process.exitCode = 1; });
