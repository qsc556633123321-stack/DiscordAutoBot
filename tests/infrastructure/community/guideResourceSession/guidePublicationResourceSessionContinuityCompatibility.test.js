const assert = require('node:assert/strict');
const path = require('node:path');
const cases = require(path.resolve(__dirname, '../../../fixtures/community/community-guide-resource-session-cases.json'));
const { createGuidePublicationResourceSession } = require('../../../../src/infrastructure/community/guidePublication/GuidePublicationResourceSession');

(async () => {
  assert.equal(cases.length, 50);
  const calls = { fetch: 0, edit: 0, send: 0 };
  const message = { async edit() { calls.edit += 1; } };
  const channel = { id: 'guide', messages: { async fetch() { calls.fetch += 1; return message; } }, async send() { calls.send += 1; } };
  const editSession = createGuidePublicationResourceSession({ ensuredChannel: channel });
  await editSession.lookupTrackedMessage('tracked');
  await editSession.editTrackedMessage({});
  assert.deepEqual(calls, { fetch: 1, edit: 1, send: 0 });
  const unavailableChannel = { id: 'guide', messages: { async fetch() { calls.fetch += 1; return null; } }, async send() { calls.send += 1; } };
  const sendSession = createGuidePublicationResourceSession({ ensuredChannel: unavailableChannel });
  await sendSession.lookupTrackedMessage('tracked');
  await sendSession.sendMessage({});
  assert.deepEqual(calls, { fetch: 2, edit: 1, send: 1 });
  const forceSession = createGuidePublicationResourceSession({ ensuredChannel: channel });
  await forceSession.sendMessage({});
  assert.deepEqual(calls, { fetch: 2, edit: 1, send: 2 });
  console.log('Guide publication resource session continuity compatibility passed');
})().catch((error) => { console.error(error); process.exitCode = 1; });
