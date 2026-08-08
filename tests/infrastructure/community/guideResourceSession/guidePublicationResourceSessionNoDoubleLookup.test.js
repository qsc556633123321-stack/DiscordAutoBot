const assert = require('node:assert/strict');
const { createFakeGuidePublicationResourceSession } = require('../../../fakes/community/FakeGuidePublicationResourceSession');

(async () => {
  const counts = { fetch: 0, edit: 0, send: 0 };
  const channel = { id: 'guide-channel', async send() { counts.send += 1; } };
  const message = { id: 'guide-message', async edit() { counts.edit += 1; } };
  const editSession = createFakeGuidePublicationResourceSession({ channel, message });
  await editSession.lookupTrackedMessage('guide-message'); counts.fetch += 1;
  await editSession.editTrackedMessage({ embeds: [] });
  assert.deepEqual(counts, { fetch: 1, edit: 1, send: 0 });
  assert.equal(editSession.calls.filter((call) => call.method === 'lookupTrackedMessage').length, 1);
  const sendSession = createFakeGuidePublicationResourceSession({ channel });
  await sendSession.sendMessage({ embeds: [] });
  assert.equal(sendSession.calls.filter((call) => call.method === 'lookupTrackedMessage').length, 0);
  assert.equal(counts.send, 1);
  console.log('Guide publication resource session no double lookup passed');
})().catch((error) => { console.error(error); process.exitCode = 1; });
