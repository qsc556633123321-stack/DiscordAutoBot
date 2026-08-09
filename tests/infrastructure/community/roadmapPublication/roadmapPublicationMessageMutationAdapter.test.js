const assert = require('node:assert/strict');
const { createRoadmapPublicationMessageMutationAdapter } = require('../../../../src/infrastructure/community/roadmapPublication/RoadmapPublicationMessageMutationAdapter');

(async () => {
  for (const resourceSession of [undefined, {}, { getRetainedMessage() {}, getRetainedMutationFailure() {}, editTrackedMessage() {} }]) {
    assert.throws(() => createRoadmapPublicationMessageMutationAdapter({ resourceSession }), /requires a resourceSession/);
  }

  const calls = { retained: 0, failure: 0, edit: 0, send: 0 };
  const retained = { id: 'M' };
  const sent = { id: 'S' };
  const payload = { embeds: [{ title: 'Roadmap' }] };
  const adapter = createRoadmapPublicationMessageMutationAdapter({
    resourceSession: {
      getRetainedMessage() { calls.retained += 1; return retained; },
      getRetainedMutationFailure() { calls.failure += 1; return { hasFailure: false }; },
      async editTrackedMessage(input) { calls.edit += 1; assert.strictEqual(input, payload); return { id: 'OTHER' }; },
      async sendMessage(input) { calls.send += 1; assert.strictEqual(input, payload); return sent; }
    }
  });

  assert.deepEqual(Object.keys(adapter).sort(), ['edit', 'send']);
  assert.deepEqual(await adapter.edit({ messageId: 'M', payload }), { kind: 'EditSuccess', messageId: 'M' });
  assert.deepEqual(await adapter.send({ payload }), { kind: 'SendSuccess', messageId: 'S' });
  assert.deepEqual(calls, { retained: 1, failure: 0, edit: 1, send: 1 });
  console.log('Roadmap production mutation adapter factory and public surface passed');
})().catch((error) => { console.error(error); process.exitCode = 1; });
