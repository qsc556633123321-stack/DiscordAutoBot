const assert = require('node:assert/strict');
const { createCommunityWelcomeChannelResolver } = require('../../../src/infrastructure/community/CommunityWelcomeChannelResolver');

function createGuild({ cacheValue = null, fetchValue = null, fetchFailure } = {}) {
  const calls = [];
  return {
    calls,
    guild: {
      channels: {
        cache: { get(value) { calls.push(['cache', value]); return cacheValue; } },
        async fetch(value) { calls.push(['fetch', value]); if (fetchFailure !== undefined) throw fetchFailure; return fetchValue; }
      }
    }
  };
}

async function resolve(options, input) {
  const fallbackCalls = [];
  const resolver = createCommunityWelcomeChannelResolver({
    guild: options.guild,
    findChannelByName(guild, name) { fallbackCalls.push([guild, name]); return options.fallbackValue; }
  });
  return { resolver, fallbackCalls, result: await resolver.resolve(input) };
}

(async () => {
  for (const [input, message] of [
    [{}, 'CommunityWelcomeChannelResolver requires guild'],
    [{ guild: {} }, 'CommunityWelcomeChannelResolver requires guild.channels.cache.get'],
    [{ guild: { channels: { cache: { get() {} } } } }, 'CommunityWelcomeChannelResolver requires guild.channels.fetch'],
    [{ guild: createGuild().guild }, 'CommunityWelcomeChannelResolver requires findChannelByName']
  ]) {
    assert.throws(() => createCommunityWelcomeChannelResolver(input), { name: 'TypeError', message });
  }

  const cached = { id: 'cached' };
  let h = createGuild({ cacheValue: cached });
  let output = await resolve({ guild: h.guild }, { trackedChannelId: 'channel', fallbackChannelName: 'guide' });
  assert.deepEqual(Object.keys(output.resolver), ['resolve']);
  assert.equal(Object.isFrozen(output.resolver), true);
  assert.equal(output.result, cached);
  assert.deepEqual(h.calls, [['cache', 'channel']]);
  assert.deepEqual(output.fallbackCalls, []);

  const fetched = { id: 'fetched' };
  const rawObject = {};
  h = createGuild({ fetchValue: fetched });
  output = await resolve({ guild: h.guild }, { trackedChannelId: rawObject, fallbackChannelName: 'guide' });
  assert.equal(output.result, fetched);
  assert.equal(h.calls[0][1], rawObject);
  assert.equal(h.calls[1][1], rawObject);
  assert.deepEqual(output.fallbackCalls, []);

  for (const failure of [new Error('x'), 'x', 1, {}, null, undefined]) {
    h = createGuild({ fetchFailure: failure });
    output = await resolve({ guild: h.guild }, { trackedChannelId: true, fallbackChannelName: 'guide' });
    assert.equal(output.result, null);
    assert.deepEqual(h.calls, [['cache', true], ['fetch', true]]);
    assert.deepEqual(output.fallbackCalls, []);
  }

  for (const trackedChannelId of [undefined, null, '', false, 0]) {
    const fallback = { id: `fallback-${String(trackedChannelId)}` };
    h = createGuild();
    output = await resolve({ guild: h.guild, fallbackValue: fallback }, { trackedChannelId, fallbackChannelName: 'guide' });
    assert.equal(output.result, fallback);
    assert.deepEqual(h.calls, []);
    assert.deepEqual(output.fallbackCalls, [[h.guild, 'guide']]);
  }

  for (const fallbackValue of [undefined, null]) {
    h = createGuild();
    output = await resolve({ guild: h.guild, fallbackValue }, { trackedChannelId: 0, fallbackChannelName: 'guide' });
    assert.equal(output.result, fallbackValue);
  }
  for (const trackedChannelId of [123, true, [], '   ']) {
    h = createGuild({ fetchValue: null });
    output = await resolve({ guild: h.guild }, { trackedChannelId, fallbackChannelName: 'guide' });
    assert.equal(h.calls[0][1], trackedChannelId);
    assert.equal(h.calls[1][1], trackedChannelId);
    assert.equal(output.result, null);
  }
  console.log('Community Welcome channel resolver preserves validation, raw-ID, identity, fallback, and swallow contracts.');
})().catch((error) => { console.error(error); process.exitCode = 1; });
