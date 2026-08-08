const assert = require('node:assert/strict');
const { createFakeGuidePublicationMessageLookupSessionAdapter } = require('../../../fakes/community/FakeGuidePublicationMessageLookupSessionAdapter');

(async () => {
  const callsA = [];
  const callsB = [];
  const adapterA = createFakeGuidePublicationMessageLookupSessionAdapter({ session: { async lookupTrackedMessage(id) { callsA.push(id); return { available: true }; } } });
  const adapterB = createFakeGuidePublicationMessageLookupSessionAdapter({ session: { async lookupTrackedMessage(id) { callsB.push(id); return { available: false }; } } });
  assert.deepEqual(await adapterA.lookup({ messageId: 'a' }), { status: 'MessageAvailable', messageId: 'a' });
  assert.deepEqual(await adapterB.lookup({ messageId: 'b' }), { status: 'MessageUnavailable', messageId: 'b' });
  assert.deepEqual(callsA, ['a']);
  assert.deepEqual(callsB, ['b']);
  console.log('Guide lookup adapter session isolation preparation passed');
})().catch((error) => { console.error(error); process.exitCode = 1; });
