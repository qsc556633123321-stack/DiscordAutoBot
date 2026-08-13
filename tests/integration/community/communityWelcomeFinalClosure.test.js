const assert = require('node:assert/strict');
const { ChannelType } = require('discord.js');
const { withOnboardingFile } = require('../../helpers/createCommunityGuideMutationHarness');

function createMember({ raw, cached, fetched, fetchError, fallback, rejection, calls }) {
  return {
    guild: {
      id: 'guild-1', name: 'Welcome Closure Guild',
      channels: {
        cache: {
          get(id) { calls.push(['cache', id]); return cached; },
          find(predicate) { calls.push(['fallback']); return fallback && predicate(fallback) ? fallback : null; }
        },
        async fetch(id) { calls.push(['fetch', id]); if (fetchError !== undefined) throw fetchError; return fetched; }
      }
    },
    send(payload) { calls.push(['send', payload]); return rejection === undefined ? Promise.resolve({ id: 'dm-1' }) : Promise.reject(rejection); }
  };
}

async function run(options = {}) {
  return withOnboardingFile({ initial: { 'guild-1': { guideChannelId: options.raw } } }, async ({ log }) => {
    const runtimePath = require.resolve('../../../src/systems/communityConcierge');
    delete require.cache[runtimePath];
    const { GUIDE_CHANNEL_NAME, sendConciergeWelcome } = require(runtimePath);
    const calls = [];
    if (options.fallback) options.fallback.name = GUIDE_CHANNEL_NAME;
    const member = createMember({ ...options, calls });
    const result = await sendConciergeWelcome(member);
    return { calls, result, reads: log.calls.filter((call) => call === 'onboarding.read').length, guideName: GUIDE_CHANNEL_NAME };
  });
}

(async () => {
  const cache = { id: 'cache-id', type: ChannelType.GuildText };
  let result = await run({ raw: 'tracked', cached: cache });
  assert.equal(result.result, undefined);
  assert.equal(result.reads, 1);
  assert.deepEqual(result.calls.map(([kind]) => kind), ['cache', 'send']);
  assert.equal(result.calls[1][1].content.includes('/cache-id'), true);

  const fetched = { id: 'fetch-id', type: ChannelType.GuildText };
  result = await run({ raw: 'tracked', fetched });
  assert.deepEqual(result.calls.map(([kind]) => kind), ['cache', 'fetch', 'send']);

  const fallback = { id: 'fallback-id', type: ChannelType.GuildText };
  result = await run({ raw: null, fallback });
  assert.deepEqual(result.calls.map(([kind]) => kind), ['fallback', 'send']);

  result = await run({ raw: null });
  assert.equal(result.result, undefined);
  assert.deepEqual(result.calls.map(([kind]) => kind), ['fallback']);

  for (const fetchError of [new Error('fetch'), 'fetch', 7, {}, null, undefined]) {
    result = await run({ raw: 'tracked', fetchError });
    assert.equal(result.result, undefined);
    assert.deepEqual(result.calls.map(([kind]) => kind), ['cache', 'fetch']);
  }
  for (const rejection of [new Error('dm'), 'dm', 7, {}, null, undefined]) {
    result = await run({ raw: 'tracked', cached: cache, rejection });
    assert.equal(result.result, undefined);
    assert.deepEqual(result.calls.map(([kind]) => kind), ['cache', 'send']);
  }
  console.log('Welcome final closure preserves cache, fetch, fallback, no-channel, DM-failure, identity, and undefined-return behavior.');
})().catch((error) => { console.error(error); process.exitCode = 1; });
