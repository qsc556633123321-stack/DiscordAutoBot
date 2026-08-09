const assert = require('node:assert/strict');
const { createFakeProductionShapeRoadmapMutationAdapter } = require('../../../fakes/community/FakeProductionShapeRoadmapMutationAdapter');

(async () => {
  for (const resourceSession of [undefined, {}, { getRetainedMessage() {}, getRetainedMutationFailure() {}, editTrackedMessage() {} }]) {
    assert.throws(() => createFakeProductionShapeRoadmapMutationAdapter({ resourceSession }), /requires a resourceSession/);
  }

  const calls = { retained: 0, failure: 0, edit: 0, send: 0 };
  const retained = { id: 'M' };
  const sent = { id: 'S' };
  const payload = { embeds: [{ title: 'Roadmap' }] };
  const adapter = createFakeProductionShapeRoadmapMutationAdapter({
    resourceSession: {
      getRetainedMessage() { calls.retained += 1; return retained; },
      getRetainedMutationFailure() { calls.failure += 1; return { hasFailure: false }; },
      async editTrackedMessage(input) { calls.edit += 1; assert.strictEqual(input, payload); return { id: 'E' }; },
      async sendMessage(input) { calls.send += 1; assert.strictEqual(input, payload); return sent; }
    }
  });

  assert.deepEqual(await adapter.edit({ messageId: 'M', payload }), { kind: 'EditSuccess', messageId: 'M' });
  assert.deepEqual(await adapter.send({ payload }), { kind: 'SendSuccess', messageId: 'S' });
  assert.deepEqual(calls, { retained: 1, failure: 0, edit: 1, send: 1 });
  console.log('Roadmap mutation adapter candidate factory and success mapping passed');
})().catch((error) => { console.error(error); process.exitCode = 1; });
