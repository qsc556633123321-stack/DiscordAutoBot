const assert = require('node:assert/strict');
const { createFakeProductionShapeRoadmapMutationAdapter } = require('../../../fakes/community/FakeProductionShapeRoadmapMutationAdapter');

(async () => {
  let editCalls = 0;
  const baseSession = {
    getRetainedMutationFailure() { return { hasFailure: false }; },
    async editTrackedMessage() { editCalls += 1; },
    async sendMessage() { return { id: 'S' }; }
  };
  const missing = createFakeProductionShapeRoadmapMutationAdapter({ resourceSession: { ...baseSession, getRetainedMessage() { return null; } } });
  await assert.rejects(() => missing.edit({ messageId: 'M', payload: {} }), /retained message/);
  const mismatch = createFakeProductionShapeRoadmapMutationAdapter({ resourceSession: { ...baseSession, getRetainedMessage() { return { id: 'M' }; } } });
  await assert.rejects(() => mismatch.edit({ messageId: 'X', payload: {} }), /match/);
  assert.equal(editCalls, 0);

  for (const result of [null, undefined, false, {}, { id: undefined }]) {
    const adapter = createFakeProductionShapeRoadmapMutationAdapter({
      resourceSession: { ...baseSession, getRetainedMessage() { return { id: 'M' }; }, async sendMessage() { return result; } }
    });
    await assert.rejects(() => adapter.send({ payload: {} }), /sent message/);
  }
  console.log('Roadmap mutation adapter candidate invariant handling passed');
})().catch((error) => { console.error(error); process.exitCode = 1; });
