const assert = require('node:assert/strict');
const { createFakeGuidePublicationAdapterPairWithMessageHandoff } = require('../../fakes/community/FakeGuidePublicationAdapterPairWithMessageHandoff');

let retainedA = null;
let retainedB = null;
let fetches = 0;
let edits = 0;
let sends = 0;
const messageOne = { id: 'message-one', async edit() { edits += 1; } };
const messageTwo = { id: 'message-two' };
const pair = createFakeGuidePublicationAdapterPairWithMessageHandoff({
  session: { getRetainedMessage() { return retainedA; } },
  lookupPort: { async lookup({ outcome }) {
    fetches += 1;
    retainedA = outcome === 'available-one' ? messageOne : outcome === 'available-two' ? messageTwo : null;
    return { status: retainedA ? 'MessageAvailable' : 'MessageUnavailable' };
  } },
  mutationPort: { async send() { sends += 1; } }
});
const otherPair = createFakeGuidePublicationAdapterPairWithMessageHandoff({
  session: { getRetainedMessage() { return retainedB; } }, lookupPort: {}, mutationPort: {}
});

(async () => {
  assert.deepEqual(Object.keys(pair).sort(), ['getRetainedMessage', 'lookupPort', 'mutationPort']);
  assert.equal(pair.getRetainedMessage(), null);
  assert.equal('session' in pair, false);
  await pair.lookupPort.lookup({ outcome: 'available-one' });
  assert.strictEqual(pair.getRetainedMessage(), messageOne);
  assert.equal(fetches, 1);
  await pair.getRetainedMessage().edit({});
  assert.equal(edits, 1);
  assert.equal(sends, 0);
  assert.strictEqual(pair.getRetainedMessage(), messageOne);
  await pair.lookupPort.lookup({ outcome: 'unavailable' });
  assert.equal(pair.getRetainedMessage(), null);
  await pair.lookupPort.lookup({ outcome: 'available-two' });
  assert.strictEqual(pair.getRetainedMessage(), messageTwo);
  retainedB = messageOne;
  assert.strictEqual(otherPair.getRetainedMessage(), messageOne);
  assert.strictEqual(pair.getRetainedMessage(), messageTwo);
  console.log('Community guide Pair retained-message handoff candidate passed');
})().catch((error) => { console.error(error); process.exitCode = 1; });
