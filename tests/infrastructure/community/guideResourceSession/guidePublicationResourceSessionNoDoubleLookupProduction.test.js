const assert = require('node:assert/strict');
const { createGuidePublicationResourceSession } = require('../../../../src/infrastructure/community/guidePublication/GuidePublicationResourceSession');

(async () => {
  const counts = { fetch: 0, edit: 0, send: 0, resolve: 0 };
  const message = { async edit() { counts.edit += 1; } };
  const channel = {
    id: 'ensured-channel',
    messages: { async fetch() { counts.fetch += 1; return message; } },
    async send() { counts.send += 1; }
  };
  const editSession = createGuidePublicationResourceSession({ ensuredChannel: channel });
  await editSession.lookupTrackedMessage('message');
  await editSession.editTrackedMessage({});
  assert.deepEqual(counts, { fetch: 1, edit: 1, send: 0, resolve: 0 });
  const sendSession = createGuidePublicationResourceSession({ ensuredChannel: channel });
  await sendSession.sendMessage({});
  assert.deepEqual(counts, { fetch: 1, edit: 1, send: 1, resolve: 0 });
  console.log('Guide publication production resource session no-double-lookup passed');
})().catch((error) => { console.error(error); process.exitCode = 1; });
