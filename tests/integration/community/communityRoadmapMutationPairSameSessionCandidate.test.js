const assert = require('node:assert/strict');
const fixture = require('../../fixtures/community/community-roadmap-pair-mutation-surface-cases.json');
const { createFakeProductionShapeRoadmapMutationAdapterPair } = require('../../fakes/community/FakeProductionShapeRoadmapMutationAdapterPair');

(async () => {
  assert.equal(fixture.cases.length, 50);
  const calls = { fetch: 0, edit: 0, send: 0 };
  const edited = { id: 'M', async edit(payload) { calls.edit += 1; assert.strictEqual(payload, editPayload); return { id: 'E' }; } };
  const sent = { id: 'S' };
  const editPayload = { embeds: [{ title: 'edit' }] };
  const sendPayload = { embeds: [{ title: 'send' }] };
  const channel = {
    id: 'roadmap',
    messages: { async fetch(id) { calls.fetch += 1; return id === 'M' ? edited : null; } },
    async send(payload) { calls.send += 1; assert.strictEqual(payload, sendPayload); return sent; }
  };
  const pair = createFakeProductionShapeRoadmapMutationAdapterPair({ ensuredChannel: channel });

  assert.deepEqual(Object.keys(pair).sort(), ['getRetainedMessage', 'lookupPort', 'mutationPort']);
  assert.equal('getRetainedMutationFailure' in pair, false);
  assert.deepEqual(await pair.lookupPort.lookupTrackedMessage({ messageId: 'M' }), { kind: 'Available', messageId: 'M' });
  assert.strictEqual(pair.getRetainedMessage(), edited);
  assert.deepEqual(await pair.mutationPort.edit({ messageId: 'M', payload: editPayload }), { kind: 'EditSuccess', messageId: 'M' });
  assert.strictEqual(pair.getRetainedMessage(), edited);
  assert.deepEqual(await pair.mutationPort.send({ payload: sendPayload }), { kind: 'SendSuccess', messageId: 'S' });
  assert.strictEqual(pair.getRetainedMessage(), sent);
  assert.deepEqual(calls, { fetch: 1, edit: 1, send: 1 });
  console.log('Roadmap mutation Pair candidate shares one Resource Session');
})().catch((error) => { console.error(error); process.exitCode = 1; });
