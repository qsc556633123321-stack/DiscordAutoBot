const assert = require('node:assert/strict');
const { createFakeGuidePublicationAdapterPairWithMessageHandoff } = require('../fakes/community/FakeGuidePublicationAdapterPairWithMessageHandoff');

const pair = createFakeGuidePublicationAdapterPairWithMessageHandoff({
  session: { getRetainedMessage() { return null; } },
  lookupPort: { lookup() {} },
  mutationPort: { edit() {}, send() {} }
});

assert.deepEqual(Object.keys(pair).sort(), ['getRetainedMessage', 'lookupPort', 'mutationPort']);
assert.equal(pair.session, undefined);
assert.equal(pair.channel, undefined);
assert.equal(pair.messages, undefined);
console.log('Community guide Pair retained-message surface narrowness passed');
