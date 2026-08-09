const assert = require('node:assert/strict');
const { createRoadmapPublicationResourceSession } = require('../../../src/infrastructure/community/roadmapPublication/RoadmapPublicationResourceSession');
const { createFakeProductionShapeRoadmapMutationAdapter } = require('../../fakes/community/FakeProductionShapeRoadmapMutationAdapter');

(async () => {
  const calls = { fetch: 0, edit: 0, send: 0 };
  const payload = { content: 'roadmap' };
  const message = { id: 'M', async edit(input) { calls.edit += 1; assert.strictEqual(input, payload); return { id: 'E' }; } };
  const sent = { id: 'S' };
  const session = createRoadmapPublicationResourceSession({
    ensuredChannel: {
      id: 'C',
      messages: { async fetch() { calls.fetch += 1; return message; } },
      async send(input) { calls.send += 1; assert.strictEqual(input, payload); return sent; }
    }
  });
  const adapter = createFakeProductionShapeRoadmapMutationAdapter({ resourceSession: session });
  await session.lookupTrackedMessage('M');
  assert.deepEqual(await adapter.edit({ messageId: 'M', payload }), { kind: 'EditSuccess', messageId: 'M' });
  assert.strictEqual(session.getRetainedMessage(), message);
  assert.deepEqual(await adapter.send({ payload }), { kind: 'SendSuccess', messageId: 'S' });
  assert.strictEqual(session.getRetainedMessage(), sent);
  assert.deepEqual(calls, { fetch: 1, edit: 1, send: 1 });
  console.log('Roadmap mutation adapter candidate preserves legacy session identity behavior');
})().catch((error) => { console.error(error); process.exitCode = 1; });
