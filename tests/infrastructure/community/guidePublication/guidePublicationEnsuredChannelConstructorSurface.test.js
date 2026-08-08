const assert = require('node:assert/strict');
const { createGuidePublicationAdapterPair } = require('../../../../src/infrastructure/community/guidePublication/GuidePublicationAdapterPairFactory');

function channel(label) {
  const calls = { fetch: 0, send: 0 };
  return {
    value: { id: label, messages: { async fetch() { calls.fetch += 1; return { id: 'tracked', async edit() {} }; } }, async send() { calls.send += 1; return { id: 'sent' }; } },
    calls
  };
}

for (const label of ['existing', 'created']) {
  const fixture = channel(label);
  const pair = createGuidePublicationAdapterPair({ ensuredChannel: fixture.value });
  assert.equal(typeof pair.lookupPort.lookup, 'function');
  assert.equal(typeof pair.mutationPort.send, 'function');
  assert.deepEqual(fixture.calls, { fetch: 0, send: 0 });
}
for (const invalid of [null, undefined, {}, { messages: {} }, { messages: { fetch() {} } }, { messages: { fetch: async () => {} }, send: null }]) {
  assert.throws(() => createGuidePublicationAdapterPair({ ensuredChannel: invalid }), /ensured channel|messages\.fetch|channel\.send/);
}
console.log('Guide ensured channel constructor surface passed');
