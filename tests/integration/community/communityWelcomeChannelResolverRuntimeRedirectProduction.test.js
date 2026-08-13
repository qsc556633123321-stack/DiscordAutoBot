const assert = require('node:assert/strict');
const { ChannelType } = require('discord.js');
const { withOnboardingFile } = require('../../helpers/createCommunityGuideMutationHarness');

function createMember({ guideName, cacheValue = null, fetchValue = null, fetchRejects = false, fetchError, fallbackValue, sendRejects = false, calls }) {
  const cache = {
    get(id) { calls.push(['cache', id]); return cacheValue; },
    find(predicate) { calls.push(['fallback']); return fallbackValue && predicate(fallbackValue) ? fallbackValue : null; }
  };
  return {
    guild: {
      id: 'guild-1', name: 'Welcome Resolver Runtime Guild',
      channels: { cache, async fetch(id) { calls.push(['fetch', id]); if (fetchRejects) throw fetchError; return fetchValue; } }
    },
    async send(payload) { calls.push(['send', payload]); if (sendRejects) throw new Error('dm failure'); },
    guideName
  };
}

async function run({ raw, cacheValue, fetchValue, fetchRejects, fetchError, fallbackValue, sendRejects = false }) {
  return withOnboardingFile({ initial: { 'guild-1': { guideChannelId: raw } } }, async ({ log: readLog }) => {
    const runtimePath = require.resolve('../../../src/systems/communityConcierge');
    delete require.cache[runtimePath];
    const { GUIDE_CHANNEL_NAME, sendConciergeWelcome } = require(runtimePath);
    const calls = [];
    if (fallbackValue) fallbackValue.name = GUIDE_CHANNEL_NAME;
    const member = createMember({ guideName: GUIDE_CHANNEL_NAME, cacheValue, fetchValue, fetchRejects, fetchError, fallbackValue, sendRejects, calls });
    const result = await sendConciergeWelcome(member);
    assert.equal(result, undefined);
    assert.equal(readLog.calls.filter((call) => call === 'onboarding.read').length, 1);
    return { calls, member, guideName: GUIDE_CHANNEL_NAME };
  });
}

(async () => {
  const cached = { id: 'cache-id', name: 'guide', type: ChannelType.GuildText };
  let result = await run({ raw: 'tracked', cacheValue: cached });
  assert.deepEqual(result.calls.map(([kind]) => kind), ['cache', 'send']);
  assert.equal(result.calls[1][1].content.includes('/cache-id'), true);

  const fetched = { id: 'fetch-id', name: 'guide', type: ChannelType.GuildText };
  result = await run({ raw: 'tracked', fetchValue: fetched });
  assert.deepEqual(result.calls.map(([kind]) => kind), ['cache', 'fetch', 'send']);
  assert.equal(result.calls[1][1], 'tracked');
  assert.equal(result.calls[2][1].content.includes('/fetch-id'), true);

  for (const error of [new Error('fetch'), 'fetch', 7, {}, null, undefined]) {
    result = await run({ raw: 'tracked', fetchRejects: true, fetchError: error });
    assert.deepEqual(result.calls.map(([kind]) => kind), ['cache', 'fetch']);
  }
  const fallback = { id: 'fallback-id', name: 'guide', type: ChannelType.GuildText };
  for (const raw of [undefined, null, '', false, 0]) {
    result = await run({ raw, fallbackValue: fallback });
    assert.deepEqual(result.calls.map(([kind]) => kind), ['fallback', 'send']);
  }
  for (const raw of [123, true, {}, [], '   ']) {
    result = await run({ raw, fetchValue: fetched });
    assert.deepEqual(result.calls.map(([kind]) => kind), ['cache', 'fetch', 'send']);
    assert.equal(result.calls[0][1], result.calls[1][1]);
    assert.deepEqual(result.calls[0][1], raw);
  }
  result = await run({ raw: null, fallbackValue: null });
  assert.deepEqual(result.calls.map(([kind]) => kind), ['fallback']);
  result = await run({ raw: 'tracked', cacheValue: cached, sendRejects: true });
  assert.deepEqual(result.calls.map(([kind]) => kind), ['cache', 'send']);
  console.log('Welcome resolver runtime redirect preserves production channel resolution, payload, DM, identity, and one-read behavior.');
})().catch((error) => { console.error(error); process.exitCode = 1; });
