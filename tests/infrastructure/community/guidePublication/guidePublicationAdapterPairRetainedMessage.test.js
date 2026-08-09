const assert = require('node:assert/strict');
const { createGuidePublicationAdapterPair } = require('../../../../src/infrastructure/community/guidePublication/GuidePublicationAdapterPairFactory');

(async () => {
  const calls = { fetch: 0, edit: 0, send: 0 };
  const first = { id: 'first', async edit() { calls.edit += 1; return this; } };
  const second = { id: 'second' };
  let next = first;
  const channel = {
    id: 'guide',
    messages: { async fetch() { calls.fetch += 1; if (next instanceof Error) throw next; return next; } },
    async send() { calls.send += 1; return { id: 'sent' }; }
  };
  const pair = createGuidePublicationAdapterPair({ ensuredChannel: channel });
  assert.deepEqual(Object.keys(pair).sort(), ['getRetainedMessage', 'lookupPort', 'mutationPort']);
  assert.equal(pair.getRetainedMessage.length, 0);
  assert.equal(pair.getRetainedMessage(), null);
  assert.equal('session' in pair, false);
  assert.equal('channel' in pair, false);
  assert.equal('getChannelId' in pair, false);
  await pair.lookupPort.lookup({ messageId: 'first' });
  assert.strictEqual(pair.getRetainedMessage(), first);
  assert.strictEqual(pair.getRetainedMessage(), first);
  assert.deepEqual(calls, { fetch: 1, edit: 0, send: 0 });
  next = second;
  await pair.lookupPort.lookup({ messageId: 'second' });
  assert.strictEqual(pair.getRetainedMessage(), second);
  next = null;
  await pair.lookupPort.lookup({ messageId: 'missing' });
  assert.equal(pair.getRetainedMessage(), null);
  next = new Error('fetch rejected');
  assert.deepEqual(await pair.lookupPort.lookup({ messageId: 'rejected' }), { status: 'MessageUnavailable', messageId: 'rejected' });
  assert.equal(pair.getRetainedMessage(), null);
  const other = createGuidePublicationAdapterPair({ ensuredChannel: channel });
  assert.equal(other.getRetainedMessage(), null);
  console.log('Guide production Pair retained-message handoff passed');
})().catch((error) => { console.error(error); process.exitCode = 1; });
