const assert = require('node:assert/strict');
const { ChannelType } = require('discord.js');
const { withOnboardingFile } = require('../../helpers/createCommunityGuideMutationHarness');
const {
  createCommunityPublicationChannelTrackingReadRequest
} = require('../../fakes/community/FakeCommunityPublicationChannelTrackingReadPort');
const {
  createFakeCommunityPublicationChannelTrackingReadCompatibilityAdapter
} = require('../../fakes/community/FakeCommunityPublicationChannelTrackingReadCompatibilityAdapter');

function equalLegacyValue(actual, expected) {
  if (actual && typeof actual === 'object') assert.deepEqual(actual, expected);
  else assert.strictEqual(actual, expected);
}

function createMember({ guildId = 'guild-1', guideChannelId = 'guide-channel', guideName, cacheHit = true, fetchSucceeds = true, sendSucceeds = true, log }) {
  const guideChannel = { id: guideChannelId, name: guideName, type: ChannelType.GuildText };
  const cache = {
    get(id) {
      log.cacheGets.push(id);
      return cacheHit && id === guideChannelId ? guideChannel : null;
    },
    find(predicate) {
      log.nameFinds += 1;
      return predicate(guideChannel) ? guideChannel : null;
    }
  };
  const guild = {
    id: guildId,
    name: 'Welcome Frozen Guild',
    channels: {
      cache,
      async fetch(id) {
        log.fetches.push(id);
        if (!fetchSucceeds) throw new Error('fetch failure');
        return guideChannel;
      }
    }
  };
  return {
    guild,
    async send(payload) {
      log.sends.push(payload);
      if (!sendSucceeds) throw new Error('send failure');
    }
  };
}

async function verify({ raw, missingGuild = false, readFails = false, cacheHit = true, fetchSucceeds = true, sendSucceeds = true }) {
  const records = raw === undefined ? { 'guild-1': {} } : { 'guild-1': { guideChannelId: raw } };
  const candidateReads = [];
  const candidate = createFakeCommunityPublicationChannelTrackingReadCompatibilityAdapter({
    readOnboardingData() {
      candidateReads.push('read');
      if (readFails) return {};
      return records;
    }
  });
  const candidateResult = candidate.readTrackedChannel(createCommunityPublicationChannelTrackingReadRequest({
    guildId: missingGuild ? 'missing-guild' : 'guild-1', publication: 'guide'
  }));
  assert.equal(candidateReads.length, 1);
  const expectedRaw = readFails || missingGuild ? undefined : raw;
  equalLegacyValue(candidateResult.trackedChannelId, expectedRaw);
  assert.deepEqual(Object.keys(candidateResult), ['trackedChannelId']);

  await withOnboardingFile({ initial: records, readFails }, async ({ log: onboardingLog }) => {
    const log = { cacheGets: [], fetches: [], nameFinds: 0, sends: [] };
    const runtimePath = require.resolve('../../../src/systems/communityConcierge');
    delete require.cache[runtimePath];
    const { GUIDE_CHANNEL_NAME, sendConciergeWelcome } = require(runtimePath);
    const runtimeMember = createMember({
      guildId: missingGuild ? 'missing-guild' : 'guild-1', guideName: GUIDE_CHANNEL_NAME,
      cacheHit, fetchSucceeds, sendSucceeds, log
    });
    await sendConciergeWelcome(runtimeMember);
    assert.equal(onboardingLog.calls.filter((call) => call === 'onboarding.read').length, 1);
    if (expectedRaw) {
      equalLegacyValue(log.cacheGets[0], expectedRaw);
      assert.equal(log.nameFinds, 0);
      if (cacheHit) assert.equal(log.fetches.length, 0);
      else assert.equal(log.fetches.length, 1);
    } else {
      assert.equal(log.cacheGets.length, 0);
      assert.equal(log.fetches.length, 0);
      assert.equal(log.nameFinds, 1);
    }
    if (expectedRaw && !cacheHit && !fetchSucceeds) assert.equal(log.sends.length, 0);
    else assert.equal(log.sends.length, 1);
  });
}

(async () => {
  await verify({ raw: 'guide-channel', cacheHit: true });
  await verify({ raw: 'guide-channel', cacheHit: false, fetchSucceeds: true });
  await verify({ raw: 'guide-channel', cacheHit: false, fetchSucceeds: false });
  for (const raw of [undefined, null, '', false, 0]) await verify({ raw });
  for (const raw of [123, true, {}, [], '   ']) await verify({ raw, cacheHit: false, fetchSucceeds: true });
  await verify({ raw: 'guide-channel', missingGuild: true });
  await verify({ raw: 'guide-channel', readFails: true });
  await verify({ raw: 'guide-channel', sendSucceeds: false });
  console.log('Welcome channel tracking candidate preserves raw IDs, one read, cache/fetch/name fallback, and send behavior.');
})().catch((error) => { console.error(error); process.exitCode = 1; });
