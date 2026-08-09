const assert = require('node:assert/strict');
const { createRoadmapPublicationAdapterPair } = require('../../../../src/infrastructure/community/roadmapPublication/RoadmapPublicationAdapterPairFactory');

(async () => {
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

  const pair = createRoadmapPublicationAdapterPair({ ensuredChannel: channel });
  assert.deepEqual(Object.keys(pair).sort(), ['getRetainedMessage', 'lookupPort']);
  for (const key of ['session', 'resourceSession', 'channel', 'mutationPort', 'sendMessage', 'editTrackedMessage']) {
    assert.equal(key in pair, false, `${key} must remain private`);
  }
  assert.equal(pair.getRetainedMessage.length, 0);
  assert.equal(pair.getRetainedMessage(), null);
  assert.deepEqual(calls, { fetch: 0, edit: 0, send: 0 });

  assert.deepEqual(await pair.lookupPort.lookupTrackedMessage({ messageId: 'M1' }), { kind: 'Available', messageId: 'M1' });
  assert.strictEqual(pair.getRetainedMessage(), first);
  assert.deepEqual(calls, { fetch: 1, edit: 0, send: 0 });
  assert.deepEqual(await pair.lookupPort.lookupTrackedMessage({ messageId: 'M2' }), { kind: 'Available', messageId: 'M2' });
  assert.strictEqual(pair.getRetainedMessage(), second);
  assert.deepEqual(await pair.lookupPort.lookupTrackedMessage({ messageId: 'missing' }), { kind: 'Unavailable' });
  assert.equal(pair.getRetainedMessage(), null);
  assert.deepEqual(await pair.lookupPort.lookupTrackedMessage({ messageId: 'rejected' }), { kind: 'Unavailable' });
  assert.equal(pair.getRetainedMessage(), null);
  assert.deepEqual(calls, { fetch: 4, edit: 0, send: 0 });
  console.log('Roadmap production adapter pair factory passed');
})().catch((error) => { console.error(error); process.exitCode = 1; });
