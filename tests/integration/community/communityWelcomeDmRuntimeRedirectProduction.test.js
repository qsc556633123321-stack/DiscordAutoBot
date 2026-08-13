const assert = require('node:assert/strict');
const { ChannelType } = require('discord.js');
const { withOnboardingFile } = require('../../helpers/createCommunityGuideMutationHarness');

function createMember({ raw = 'tracked', channel, rejection, calls }) {
  return {
    guild: {
      id: 'guild-1', name: 'Welcome DM Runtime Guild',
      channels: {
        cache: {
          get(id) { calls.push(['cache', id]); return raw ? channel : null; },
          find(predicate) { calls.push(['fallback']); return !raw && channel && predicate(channel) ? channel : null; }
        },
        async fetch(id) { calls.push(['fetch', id]); return null; }
      }
    },
    send(payload) {
      calls.push(['send', payload]);
      return rejection === undefined ? Promise.resolve({ id: 'dm-1' }) : Promise.reject(rejection);
    }
  };
}

async function run({ raw = 'tracked', channel, rejection } = {}) {
  return withOnboardingFile({ initial: { 'guild-1': { guideChannelId: raw } } }, async ({ log }) => {
    const runtimePath = require.resolve('../../../src/systems/communityConcierge');
    delete require.cache[runtimePath];
    const { GUIDE_CHANNEL_NAME, sendConciergeWelcome } = require(runtimePath);
    const calls = [];
    const member = createMember({ raw, channel, rejection, calls });
    const result = await sendConciergeWelcome(member);
    return { calls, result, member, reads: log.calls.filter((call) => call === 'onboarding.read').length, guideName: GUIDE_CHANNEL_NAME };
  });
}

(async () => {
  const channel = { id: 'guide-1', type: ChannelType.GuildText };
  let result = await run({ channel });
  assert.equal(result.result, undefined);
  assert.equal(result.reads, 1);
  assert.deepEqual(result.calls.map(([kind]) => kind), ['cache', 'send']);
  assert.equal(result.calls[1][1].content.includes('/guide-1'), true);

  for (const rejection of [new Error('dm'), 'dm', 7, {}, null, undefined]) {
    result = await run({ channel, rejection });
    assert.equal(result.result, undefined);
    assert.deepEqual(result.calls.map(([kind]) => kind), ['cache', 'send']);
  }

  result = await run({ raw: null, channel: null });
  assert.equal(result.result, undefined);
  assert.deepEqual(result.calls.map(([kind]) => kind), ['fallback']);
  console.log('Welcome production DM redirect preserves one read, channel isolation, payload identity, swallowed failures, and undefined return.');
})().catch((error) => { console.error(error); process.exitCode = 1; });
