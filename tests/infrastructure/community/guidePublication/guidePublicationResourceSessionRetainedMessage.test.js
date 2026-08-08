const assert = require('node:assert/strict');
const { createGuidePublicationResourceSession } = require('../../../../src/infrastructure/community/guidePublication/GuidePublicationResourceSession');

function createChannel(outcomes) {
  const calls = { fetch: 0, edit: 0, send: 0 };
  const queue = [...outcomes];
  return {
    calls,
    channel: {
      id: 'guide',
      messages: { async fetch() { calls.fetch += 1; const value = queue.shift(); if (value instanceof Error) throw value; return value; } },
      async send() { calls.send += 1; return { id: 'sent' }; }
    }
  };
}

(async () => {
  const first = { id: 'first', async edit() {} };
  const second = { id: 'second', async edit() {} };
  const current = createChannel([first, second, null, first, new Error('fetch failed')]);
  const session = createGuidePublicationResourceSession({ ensuredChannel: current.channel });

  assert.equal(session.getRetainedMessage(), null);
  assert.equal(session.getRetainedMessage(), null);
  assert.equal(current.calls.fetch, 0);
  await session.lookupTrackedMessage('first');
  assert.strictEqual(session.getRetainedMessage(), first);
  assert.strictEqual(session.getRetainedMessage(), first);
  assert.equal(current.calls.fetch, 1);
  await session.lookupTrackedMessage('second');
  assert.strictEqual(session.getRetainedMessage(), second);
  assert.equal(current.calls.fetch, 2);
  await session.lookupTrackedMessage('missing');
  assert.equal(session.getRetainedMessage(), null);
  await session.lookupTrackedMessage('first-again');
  assert.strictEqual(session.getRetainedMessage(), first);
  await assert.rejects(() => session.lookupTrackedMessage('rejected'), /fetch failed/);
  assert.equal(session.getRetainedMessage(), null);
  assert.equal(current.calls.edit, 0);
  assert.equal(current.calls.send, 0);

  const shared = createChannel([first, second]);
  const a = createGuidePublicationResourceSession({ ensuredChannel: shared.channel });
  const b = createGuidePublicationResourceSession({ ensuredChannel: shared.channel });
  await a.lookupTrackedMessage('a');
  await b.lookupTrackedMessage('b');
  assert.strictEqual(a.getRetainedMessage(), first);
  assert.strictEqual(b.getRetainedMessage(), second);
  console.log('Guide resource session retained-message accessor passed');
})().catch((error) => { console.error(error); process.exitCode = 1; });
