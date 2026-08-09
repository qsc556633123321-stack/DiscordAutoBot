const assert = require('node:assert/strict');
const { createFakeProductionShapeRoadmapMutationAdapter } = require('../../fakes/community/FakeProductionShapeRoadmapMutationAdapter');

(async () => {
  for (const method of ['edit', 'send']) {
    for (const rejection of [new Error(method), method, 7, { method }, null, undefined]) {
      const adapter = createFakeProductionShapeRoadmapMutationAdapter({
        resourceSession: {
          getRetainedMessage() { return { id: 'M' }; },
          getRetainedMutationFailure() { return { hasFailure: true, failure: rejection }; },
          async editTrackedMessage() { throw rejection; },
          async sendMessage() { throw rejection; }
        }
      });
      const operation = method === 'edit'
        ? () => adapter.edit({ messageId: 'M', payload: {} })
        : () => adapter.send({ payload: {} });
      await assert.rejects(operation, (actual) => actual === rejection);
    }
  }
  console.log('Roadmap mutation adapter candidate preserves exact raw failures');
})().catch((error) => { console.error(error); process.exitCode = 1; });
