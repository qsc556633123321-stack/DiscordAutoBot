const assert = require('node:assert/strict');
const { createCommunityPublicationChannelTrackingReadRequest } = require('../../../src/application/community/ports/CommunityPublicationChannelTrackingReadPort');
const { createCommunityPublicationChannelTrackingReadCompatibilityAdapter } = require('../../../src/infrastructure/community/CommunityPublicationChannelTrackingReadCompatibilityAdapter');
const { createCommunityWelcomeChannelResolver } = require('../../../src/infrastructure/community/CommunityWelcomeChannelResolver');
const { mapLegacyWelcomeDeliveryRequest, buildCommunityWelcomeMessage } = require('../../../src/application/community');
const { createCommunityWelcomeDmDeliveryAdapter } = require('../../fakes/community/FakeCommunityWelcomeDmDeliveryAdapterV2');

async function deliverCandidate({ member, records, findChannelByName, guideChannelName, createAdapter = createCommunityWelcomeDmDeliveryAdapter }) {
  const trackingReadPort = createCommunityPublicationChannelTrackingReadCompatibilityAdapter({
    onboardingStateReader: { readOnboardingState: () => records }
  });
  const { trackedChannelId } = trackingReadPort.readTrackedChannel(createCommunityPublicationChannelTrackingReadRequest({
    guildId: member.guild.id, publication: 'guide'
  }));
  const guideChannel = await createCommunityWelcomeChannelResolver({ guild: member.guild, findChannelByName }).resolve({
    trackedChannelId,
    fallbackChannelName: guideChannelName
  });
  if (!guideChannel) return;
  const payload = buildCommunityWelcomeMessage(
    mapLegacyWelcomeDeliveryRequest({ guildId: member.guild.id, guideChannelId: guideChannel.id }),
    { guildName: member.guild.name }
  );
  await createAdapter({ member }).send(payload);
}

function harness({ channel, cacheValue = null, fetchValue = null, sendRejection } = {}) {
  const calls = [];
  const member = {
    guild: {
      id: 'guild-1', name: 'DM Candidate Guild',
      channels: {
        cache: { get(id) { calls.push(['cache', id]); return cacheValue; } },
        async fetch(id) { calls.push(['fetch', id]); return fetchValue; }
      }
    },
    send(payload) { calls.push(['send', payload]); return sendRejection ? Promise.reject(sendRejection) : Promise.resolve({ id: 'message' }); }
  };
  return { calls, member, findChannelByName(_guild, name) { calls.push(['fallback', name]); return channel; } };
}

(async () => {
  const cacheChannel = { id: 'cache-channel' };
  let h = harness({ cacheValue: cacheChannel });
  await deliverCandidate({ member: h.member, records: { 'guild-1': { guideChannelId: 'tracked' } }, findChannelByName: h.findChannelByName, guideChannelName: 'guide' });
  assert.deepEqual(h.calls.map(([kind]) => kind), ['cache', 'send']);
  assert.equal(h.calls[1][1].content.includes('/cache-channel'), true);

  const fetchChannel = { id: 'fetch-channel' };
  h = harness({ fetchValue: fetchChannel });
  await deliverCandidate({ member: h.member, records: { 'guild-1': { guideChannelId: 'tracked' } }, findChannelByName: h.findChannelByName, guideChannelName: 'guide' });
  assert.deepEqual(h.calls.map(([kind]) => kind), ['cache', 'fetch', 'send']);

  const fallbackChannel = { id: 'fallback-channel' };
  h = harness({ channel: fallbackChannel });
  await deliverCandidate({ member: h.member, records: { 'guild-1': {} }, findChannelByName: h.findChannelByName, guideChannelName: 'guide' });
  assert.deepEqual(h.calls.map(([kind]) => kind), ['fallback', 'send']);

  let adapterConstructed = 0;
  h = harness({ channel: null });
  await deliverCandidate({ member: h.member, records: { 'guild-1': {} }, findChannelByName: h.findChannelByName, guideChannelName: 'guide', createAdapter(args) { adapterConstructed += 1; return createCommunityWelcomeDmDeliveryAdapter(args); } });
  assert.equal(adapterConstructed, 0);
  assert.deepEqual(h.calls.map(([kind]) => kind), ['fallback']);

  h = harness({ cacheValue: cacheChannel, sendRejection: new Error('dm') });
  await deliverCandidate({ member: h.member, records: { 'guild-1': { guideChannelId: 'tracked' } }, findChannelByName: h.findChannelByName, guideChannelName: 'guide' });
  assert.deepEqual(h.calls.map(([kind]) => kind), ['cache', 'send']);
  console.log('Welcome DM delivery end-to-end candidate preserves channel boundaries, no-channel isolation, and swallowed delivery failure.');
})().catch((error) => { console.error(error); process.exitCode = 1; });
