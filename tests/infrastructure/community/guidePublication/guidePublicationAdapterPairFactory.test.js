const assert = require('node:assert/strict');
const { createGuidePublicationAdapterPair } = require('../../../../src/infrastructure/community/guidePublication/GuidePublicationAdapterPairFactory');
const { assertGuidePublicationMessageLookupPort } = require('../../../../src/application/community/ports/GuidePublicationMessageLookupPort');
const { assertGuidePublicationMessageMutationPort } = require('../../../../src/application/community/ports/GuidePublicationMessageMutationPort');

(async () => {
  assert.throws(() => createGuidePublicationAdapterPair(), /ensured channel/);
  const calls = { fetch: 0, edit: 0, send: 0 };
  const message = { id: 'tracked', async edit() { calls.edit += 1; return this; } };
  const channel = { id: 'guide', messages: { async fetch() { calls.fetch += 1; return message; } }, async send() { calls.send += 1; return { id: 'sent' }; } };
  const pair = createGuidePublicationAdapterPair({ ensuredChannel: channel });
  assertGuidePublicationMessageLookupPort(pair.lookupPort);
  assertGuidePublicationMessageMutationPort(pair.mutationPort);
  assert.equal('session' in pair, false);
  await pair.lookupPort.lookup({ messageId: 'tracked' });
  assert.deepEqual(await pair.mutationPort.edit({ messageId: 'tracked', payload: {} }), { kind: 'EditSuccess', messageId: 'tracked' });
  assert.deepEqual(await pair.mutationPort.send({ payload: {} }), { kind: 'SendSuccess', messageId: 'sent' });
  assert.deepEqual(calls, { fetch: 1, edit: 1, send: 1 });
  console.log('Guide production adapter pair factory passed');
})().catch((error) => { console.error(error); process.exitCode = 1; });
