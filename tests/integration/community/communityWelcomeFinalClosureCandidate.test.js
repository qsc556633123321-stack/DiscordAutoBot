const assert = require('node:assert/strict');
const { createFakeCommunityWelcomeChannelResolver } = require('../../fakes/community/FakeCommunityWelcomeChannelResolver');
const { createFakeCommunityWelcomeDmDeliveryAdapter } = require('../../fakes/community/FakeCommunityWelcomeDmDeliveryAdapter');

function createHarness({ cacheValue = null, fetchValue = null, fetchRejects = false, nameValue = null, sendRejects = false } = {}) {
  const calls = [];
  const guild = {
    channels: {
      cache: { get(id) { calls.push(['cache', id]); return cacheValue; } },
      async fetch(id) { calls.push(['fetch', id]); if (fetchRejects) throw new Error('fetch'); return fetchValue; }
    }
  };
  const member = { async send(payload) { calls.push(['send', payload]); if (sendRejects) throw new Error('dm'); } };
  const findChannelByName = (_guild, name) => { calls.push(['name', name]); return nameValue; };
  return { calls, guild, member, findChannelByName };
}

(async () => {
  const cached = { id: 'cached' };
  let h = createHarness({ cacheValue: cached });
  assert.equal(await createFakeCommunityWelcomeChannelResolver({ guild: h.guild, findChannelByName: h.findChannelByName }).resolve({ trackedChannelId: 'id', fallbackChannelName: 'guide' }), cached);
  assert.deepEqual(h.calls, [['cache', 'id']]);

  const fetched = { id: 'fetched' };
  h = createHarness({ fetchValue: fetched });
  assert.equal(await createFakeCommunityWelcomeChannelResolver({ guild: h.guild, findChannelByName: h.findChannelByName }).resolve({ trackedChannelId: 123, fallbackChannelName: 'guide' }), fetched);
  assert.deepEqual(h.calls, [['cache', 123], ['fetch', 123]]);

  h = createHarness({ fetchRejects: true });
  assert.equal(await createFakeCommunityWelcomeChannelResolver({ guild: h.guild, findChannelByName: h.findChannelByName }).resolve({ trackedChannelId: true, fallbackChannelName: 'guide' }), null);
  assert.deepEqual(h.calls, [['cache', true], ['fetch', true]]);

  for (const trackedChannelId of [undefined, null, '', false, 0]) {
    const fallback = { id: `fallback-${String(trackedChannelId)}` };
    h = createHarness({ nameValue: fallback });
    assert.equal(await createFakeCommunityWelcomeChannelResolver({ guild: h.guild, findChannelByName: h.findChannelByName }).resolve({ trackedChannelId, fallbackChannelName: 'guide' }), fallback);
    assert.deepEqual(h.calls, [['name', 'guide']]);
  }

  h = createHarness();
  assert.equal(await createFakeCommunityWelcomeChannelResolver({ guild: h.guild, findChannelByName: h.findChannelByName }).resolve({ trackedChannelId: null, fallbackChannelName: 'guide' }), null);
  assert.deepEqual(h.calls, [['name', 'guide']]);

  const payload = { embeds: [{ title: 'Welcome' }] };
  h = createHarness();
  await createFakeCommunityWelcomeDmDeliveryAdapter({ member: h.member }).send(payload);
  assert.deepEqual(h.calls, [['send', payload]]);
  h = createHarness({ sendRejects: true });
  assert.equal(await createFakeCommunityWelcomeDmDeliveryAdapter({ member: h.member }).send(payload), null);
  assert.deepEqual(h.calls, [['send', payload]]);
  console.log('Welcome final closure candidates preserve channel identity, lookup semantics, and swallowed DM failures.');
})().catch((error) => { console.error(error); process.exitCode = 1; });
