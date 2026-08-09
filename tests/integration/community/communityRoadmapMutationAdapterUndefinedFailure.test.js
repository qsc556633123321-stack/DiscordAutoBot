const assert = require('node:assert/strict');
const { createFakeProductionShapeRoadmapMutationAdapter } = require('../../fakes/community/FakeProductionShapeRoadmapMutationAdapter');

(async () => {
  for (const method of ['editTrackedMessage', 'sendMessage']) {
    let retained = { id: 'M' };
    let failure = { hasFailure: false };
    const adapter = createFakeProductionShapeRoadmapMutationAdapter({
      resourceSession: {
        getRetainedMessage() { return retained; },
        getRetainedMutationFailure() { return failure; },
        async editTrackedMessage() { failure = { hasFailure: true, failure: undefined }; throw undefined; },
        async sendMessage() { failure = { hasFailure: true, failure: undefined }; throw undefined; }
      }
    });
    const operation = method === 'edit'
      ? () => adapter.edit({ messageId: 'M', payload: {} })
      : () => adapter.send({ payload: {} });
    await assert.rejects(operation, (rejection) => rejection === undefined);
    assert.deepEqual(adapter ? failure : null, { hasFailure: true, failure: undefined });
  }
  console.log('Roadmap mutation adapter candidate preserves undefined rejection identity');
})().catch((error) => { console.error(error); process.exitCode = 1; });
