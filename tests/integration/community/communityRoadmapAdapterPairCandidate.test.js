const assert = require('node:assert/strict');
const fixture = require('../../fixtures/community/community-roadmap-adapter-pair-cases.json');
const { createFakeRoadmapPublicationAdapterPair } = require('../../fakes/community/FakeRoadmapPublicationAdapterPair');

(async () => {
  assert.equal(fixture.cases.length, 40);
  const calls = { fetch: 0, edit: 0, send: 0 };
  const first = { id: 'M1' };
  const second = { id: 'M2' };
  const channel = {
    id: 'roadmap-channel',
    messages: {
      async fetch(messageId) {
        calls.fetch += 1;
        if (messageId === 'M1') return first;
        if (messageId === 'M2') return second;
        if (messageId === 'rejected') throw new Error('fetch rejected');
        return null;
      }
    },
    async edit() { calls.edit += 1; },
    async send() { calls.send += 1; }
  };

  const pair = createFakeRoadmapPublicationAdapterPair({ ensuredChannel: channel });
  assert.deepEqual(Object.keys(pair).sort(), ['getRetainedMessage', 'lookupPort']);
  assert.equal(pair.getRetainedMessage.length, 0);
  assert.equal(pair.getRetainedMessage(), null);
  assert.equal('resourceSession' in pair, false);
  assert.equal('session' in pair, false);
  assert.equal('mutationPort' in pair, false);
  assert.deepEqual(calls, { fetch: 0, edit: 0, send: 0 });

  assert.deepEqual(await pair.lookupPort.lookupTrackedMessage({ messageId: 'M1' }), { kind: 'Available', messageId: 'M1' });
  assert.strictEqual(pair.getRetainedMessage(), first);
  assert.strictEqual(pair.getRetainedMessage(), first);
  assert.deepEqual(calls, { fetch: 1, edit: 0, send: 0 });

  assert.deepEqual(await pair.lookupPort.lookupTrackedMessage({ messageId: 'missing' }), { kind: 'Unavailable' });
  assert.equal(pair.getRetainedMessage(), null);
  assert.deepEqual(await pair.lookupPort.lookupTrackedMessage({ messageId: 'rejected' }), { kind: 'Unavailable' });
  assert.equal(pair.getRetainedMessage(), null);
  assert.deepEqual(calls, { fetch: 3, edit: 0, send: 0 });
  console.log('Roadmap adapter pair candidate behavior passed');
})().catch((error) => { console.error(error); process.exitCode = 1; });
