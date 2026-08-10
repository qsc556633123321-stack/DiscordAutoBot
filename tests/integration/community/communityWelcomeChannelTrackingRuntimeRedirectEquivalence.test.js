const assert = require('node:assert/strict');
const { ChannelType } = require('discord.js');
const { withOnboardingFile } = require('../../helpers/createCommunityGuideMutationHarness');
const { sendWelcomeWithChannelTrackingRead } = require('../../fakes/community/FakeCommunityWelcomeChannelTrackingRuntimeRedirect');

function createMember({ guideName, cacheHit = true, fetchSucceeds = true, hasChannel = true, sendSucceeds = true, log }) {
  const channel = { id: 'guide-channel', name: guideName, type: ChannelType.GuildText };
  const cache = {
    get(id) { log.calls.push(`cache:${String(id)}`); return cacheHit && hasChannel && id === 'guide-channel' ? channel : null; },
    find(predicate) { log.calls.push('name-find'); return hasChannel && predicate(channel) ? channel : null; }
  };
  return {
    guild: {
      id: 'guild-1', name: 'Welcome Frozen Guild',
      channels: { cache, async fetch(id) { log.calls.push(`fetch:${String(id)}`); if (!fetchSucceeds) throw new Error('fetch failure'); return hasChannel ? channel : null; } }
    },
    async send(payload) { log.calls.push('member-send'); log.payload = payload; if (!sendSucceeds) throw new Error('send failure'); }
  };
}

function findChannelByName(guild, name) {
  return guild.channels.cache.find((channel) => channel.type === ChannelType.GuildText && channel.name === name) || null;
}

async function runLegacy({ records, readFails, options, guideName }) {
  return withOnboardingFile({ initial: records, readFails }, async ({ log: readLog }) => {
    const log = { calls: [] };
    const runtimePath = require.resolve('../../../src/systems/communityConcierge');
    delete require.cache[runtimePath];
    const { sendConciergeWelcome } = require(runtimePath);
    await sendConciergeWelcome(createMember({ guideName, ...options, log }));
    return { log, reads: readLog.calls.filter((call) => call === 'onboarding.read').length };
  });
}

async function runCandidate({ records, readFails, options, guideName }) {
  const log = { calls: [] };
  let reads = 0;
  const member = createMember({ guideName, ...options, log });
  await sendWelcomeWithChannelTrackingRead({
    member,
    readOnboardingData() { reads += 1; return readFails ? {} : records; },
    findChannelByName,
    guideChannelName: guideName
  });
  return { log, reads };
}

async function verify({ raw, readFails = false, options = {}, missingGuild = false }) {
  const records = missingGuild ? {} : raw === undefined ? { 'guild-1': {} } : { 'guild-1': { guideChannelId: raw } };
  const runtimePath = require.resolve('../../../src/systems/communityConcierge');
  delete require.cache[runtimePath];
  const { GUIDE_CHANNEL_NAME } = require(runtimePath);
  const input = { records, readFails, options, guideName: GUIDE_CHANNEL_NAME };
  const legacy = await runLegacy(input);
  const future = await runCandidate(input);
  assert.equal(legacy.reads, 1);
  assert.equal(future.reads, 1);
  assert.deepEqual(future.log.calls, legacy.log.calls);
  assert.deepEqual(future.log.payload, legacy.log.payload);
}

(async () => {
  await verify({ raw: 'guide-channel' });
  await verify({ raw: 'guide-channel', options: { cacheHit: false } });
  await verify({ raw: 'guide-channel', options: { cacheHit: false, fetchSucceeds: false } });
  for (const raw of [undefined, null, '', false, 0]) await verify({ raw });
  for (const raw of [123, true, {}, [], '   ']) await verify({ raw, options: { cacheHit: false } });
  await verify({ raw: 'guide-channel', missingGuild: true });
  await verify({ raw: 'guide-channel', readFails: true });
  await verify({ raw: 'guide-channel', options: { hasChannel: false } });
  await verify({ raw: 'guide-channel', options: { sendSucceeds: false } });
  console.log('Welcome runtime redirect candidate preserves ID, lookup, payload, send, failure, and one-read behavior.');
})().catch((error) => { console.error(error); process.exitCode = 1; });
