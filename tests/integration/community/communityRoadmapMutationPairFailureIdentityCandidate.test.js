const assert = require('node:assert/strict');
const { createFakeProductionShapeRoadmapMutationAdapterPair } = require('../../fakes/community/FakeProductionShapeRoadmapMutationAdapterPair');

(async () => {
  for (const failure of [new Error('error'), 'string', 7, { code: 'object' }, null, undefined]) {
    const message = { id: 'M', async edit() { return Promise.reject(failure); } };
    const channel = { id: 'roadmap', messages: { async fetch() { return message; } }, async send() { return Promise.reject(failure); } };
    const pair = createFakeProductionShapeRoadmapMutationAdapterPair({ ensuredChannel: channel });
    await pair.lookupPort.lookupTrackedMessage({ messageId: 'M' });
    await assert.rejects(pair.mutationPort.edit({ messageId: 'M', payload: {} }), (actual) => actual === failure);
    assert.strictEqual(pair.getRetainedMessage(), message);
    await assert.rejects(pair.mutationPort.send({ payload: {} }), (actual) => actual === failure);
    assert.strictEqual(pair.getRetainedMessage(), message);
    assert.equal('getRetainedMutationFailure' in pair, false);
  }
  console.log('Roadmap mutation Pair candidate preserves exact raw failures without failure getter exposure');
})().catch((error) => { console.error(error); process.exitCode = 1; });
