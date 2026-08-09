const assert = require('node:assert/strict');
const { createFakeRoadmapPublicationAdapterPair } = require('../../fakes/community/FakeRoadmapPublicationAdapterPair');

(() => {
  const calls = { fetch: 0, edit: 0, send: 0 };
  const channel = {
    id: 'roadmap-channel',
    messages: { async fetch() { calls.fetch += 1; return null; } },
    async edit() { calls.edit += 1; },
    async send() { calls.send += 1; }
  };
  const pair = createFakeRoadmapPublicationAdapterPair({ ensuredChannel: channel });
  assert.equal(pair.getRetainedMessage(), null);
  assert.deepEqual(calls, { fetch: 0, edit: 0, send: 0 });
  assert.throws(() => createFakeRoadmapPublicationAdapterPair({ ensuredChannel: { id: 'missing-fetch' } }), /messages\.fetch/);
  console.log('Roadmap adapter pair candidate zero-I/O contract passed');
})();
