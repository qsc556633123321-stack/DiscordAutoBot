const assert = require('node:assert/strict');
const { createGuidePublicationResourceSession } = require('../../../../src/infrastructure/community/guidePublication/GuidePublicationResourceSession');
const { createFakeGuidePublicationMessageLookupSessionAdapter } = require('../../../fakes/community/FakeGuidePublicationMessageLookupSessionAdapter');

(async () => {
  const counts = { fetch: 0, edit: 0 };
  const message = { async edit() { counts.edit += 1; } };
  const channel = { id: 'guide', messages: { async fetch() { counts.fetch += 1; return message; } }, async send() {} };
  const session = createGuidePublicationResourceSession({ ensuredChannel: channel });
  const adapter = createFakeGuidePublicationMessageLookupSessionAdapter({ session });
  assert.deepEqual(await adapter.lookup({ messageId: 'tracked' }), { status: 'MessageAvailable', messageId: 'tracked' });
  await session.editTrackedMessage({ embeds: [] });
  assert.deepEqual(counts, { fetch: 1, edit: 1 });
  console.log('Guide lookup adapter session continuity preparation passed');
})().catch((error) => { console.error(error); process.exitCode = 1; });
