const assert = require('node:assert/strict');
const { createCommunityWelcomeChannelResolver } = require('../../../src/infrastructure/community/CommunityWelcomeChannelResolver');

function legacyResolve(guild, findChannelByName, trackedChannelId, fallbackChannelName) {
  return trackedChannelId
    ? guild.channels.cache.get(trackedChannelId) || guild.channels.fetch(trackedChannelId).catch(() => null)
    : findChannelByName(guild, fallbackChannelName);
}

function createHarness({ cacheValue = null, fetchValue = null, reject = false, fallbackValue = null } = {}) {
  const calls = [];
  const guild = { channels: { cache: { get(id) { calls.push(['cache', id]); return cacheValue; } }, async fetch(id) { calls.push(['fetch', id]); if (reject) throw 'sentinel'; return fetchValue; } } };
  const findChannelByName = (_guild, name) => { calls.push(['fallback', name]); return fallbackValue; };
  return { calls, guild, findChannelByName };
}

(async () => {
  for (const scenario of [
    { trackedChannelId: 'id', cacheValue: { id: 'cache' } },
    { trackedChannelId: 'id', fetchValue: { id: 'fetch' } },
    { trackedChannelId: 'id', reject: true },
    { trackedChannelId: undefined, fallbackValue: { id: 'fallback' } },
    { trackedChannelId: null, fallbackValue: null },
    { trackedChannelId: 123 }, { trackedChannelId: true }, { trackedChannelId: {} }, { trackedChannelId: [] }, { trackedChannelId: '   ' }
  ]) {
    const legacy = createHarness(scenario);
    const candidate = createHarness(scenario);
    const legacyResult = await legacyResolve(legacy.guild, legacy.findChannelByName, scenario.trackedChannelId, 'guide');
    const resolver = createCommunityWelcomeChannelResolver({ guild: candidate.guild, findChannelByName: candidate.findChannelByName });
    const candidateResult = await resolver.resolve({ trackedChannelId: scenario.trackedChannelId, fallbackChannelName: 'guide' });
    assert.equal(candidateResult, legacyResult);
    assert.deepEqual(candidate.calls, legacy.calls);
  }
  console.log('Community Welcome channel resolver is observably equivalent to the legacy resolution expression.');
})().catch((error) => { console.error(error); process.exitCode = 1; });
