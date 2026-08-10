const assert = require('node:assert/strict');
const { ChannelType } = require('discord.js');
const { withOnboardingFile } = require('../../helpers/createCommunityGuideMutationHarness');

function createMember({ guideName, cacheHit = true, fetchSucceeds = true, hasChannel = true, sendSucceeds = true, log }) {
  const channel = { id: 'guide-channel', name: guideName, type: ChannelType.GuildText };
  const cache = {
    get(id) { log.calls.push(`cache:${String(id)}`); return cacheHit && hasChannel && id === 'guide-channel' ? channel : null; },
    find(predicate) { log.calls.push('name-find'); return hasChannel && predicate(channel) ? channel : null; }
  };
  return {
    guild: {
      id: 'guild-1', name: 'Welcome Runtime Guild',
      channels: { cache, async fetch(id) { log.calls.push(`fetch:${String(id)}`); if (!fetchSucceeds) throw new Error('fetch failure'); return hasChannel ? channel : null; } }
    },
    async send(payload) { log.calls.push('member-send'); log.payload = payload; if (!sendSucceeds) throw new Error('send failure'); }
  };
}

async function runProduction({ records, readFails = false, options = {}, expectedCalls }) {
  return withOnboardingFile({ initial: records, readFails }, async ({ log: readLog }) => {
    const runtimePath = require.resolve('../../../src/systems/communityConcierge');
    delete require.cache[runtimePath];
    const { GUIDE_CHANNEL_NAME, sendConciergeWelcome } = require(runtimePath);
    const log = { calls: [] };
    const result = await sendConciergeWelcome(createMember({ guideName: GUIDE_CHANNEL_NAME, ...options, log }));
    assert.equal(result, undefined);
    assert.equal(readLog.calls.filter((call) => call === 'onboarding.read').length, 1);
    assert.deepEqual(log.calls, expectedCalls);
    return log;
  });
}

(async () => {
  const cacheHit = await runProduction({
    records: { 'guild-1': { guideChannelId: 'guide-channel' } },
    expectedCalls: ['cache:guide-channel', 'member-send']
  });
  assert.ok(cacheHit.payload);

  await runProduction({
    records: { 'guild-1': { guideChannelId: 'guide-channel' } },
    options: { cacheHit: false },
    expectedCalls: ['cache:guide-channel', 'fetch:guide-channel', 'member-send']
  });
  await runProduction({
    records: { 'guild-1': { guideChannelId: 'guide-channel' } },
    options: { cacheHit: false, fetchSucceeds: false },
    expectedCalls: ['cache:guide-channel', 'fetch:guide-channel']
  });
  for (const raw of [undefined, null, '', false, 0]) {
    await runProduction({
      records: { 'guild-1': { guideChannelId: raw } },
      expectedCalls: ['name-find', 'member-send']
    });
  }
  for (const raw of [123, true, {}, [], '   ']) {
    await runProduction({
      records: { 'guild-1': { guideChannelId: raw } },
      options: { cacheHit: false },
      expectedCalls: [`cache:${String(raw)}`, `fetch:${String(raw)}`, 'member-send']
    });
  }
  await runProduction({ records: {}, expectedCalls: ['name-find', 'member-send'] });
  await runProduction({ records: { 'guild-1': { guideChannelId: 'guide-channel' } }, readFails: true, expectedCalls: ['name-find', 'member-send'] });
  await runProduction({ records: { 'guild-1': { guideChannelId: 'guide-channel' } }, options: { hasChannel: false }, expectedCalls: ['cache:guide-channel', 'fetch:guide-channel'] });
  await runProduction({ records: { 'guild-1': { guideChannelId: 'guide-channel' } }, options: { sendSucceeds: false }, expectedCalls: ['cache:guide-channel', 'member-send'] });
  console.log('Welcome production channel-tracking redirect preserves lookup, fallback, payload, delivery, and one-read behavior.');
})().catch((error) => { console.error(error); process.exitCode = 1; });
