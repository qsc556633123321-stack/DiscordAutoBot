const assert = require('node:assert/strict');
const { createGuidePublicationMessageLookupDiscordAdapter } = require('../../../../src/infrastructure/community/guidePublication/GuidePublicationMessageLookupDiscordAdapter');

(async () => {
  const callsA = [];
  const callsB = [];
  const adapterA = createGuidePublicationMessageLookupDiscordAdapter({ session: { async lookupTrackedMessage(id) { callsA.push(id); return { available: true }; } } });
  const adapterB = createGuidePublicationMessageLookupDiscordAdapter({ session: { async lookupTrackedMessage(id) { callsB.push(id); return { available: false }; } } });
  assert.deepEqual(await adapterA.lookup({ messageId: 'a' }), { status: 'MessageAvailable', messageId: 'a' });
  assert.deepEqual(await adapterB.lookup({ messageId: 'b' }), { status: 'MessageUnavailable', messageId: 'b' });
  assert.deepEqual(callsA, ['a']);
  assert.deepEqual(callsB, ['b']);
  console.log('Guide production lookup adapter isolation passed');
})().catch((error) => { console.error(error); process.exitCode = 1; });
