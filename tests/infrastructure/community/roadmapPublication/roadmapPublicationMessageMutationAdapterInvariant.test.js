const assert = require('node:assert/strict');
const { createRoadmapPublicationMessageMutationAdapter } = require('../../../../src/infrastructure/community/roadmapPublication/RoadmapPublicationMessageMutationAdapter');

(async () => {
  let editCalls = 0;
  const baseSession = {
    getRetainedMutationFailure() { return { hasFailure: false }; },
    async editTrackedMessage() { editCalls += 1; },
    async sendMessage() { return { id: 'S' }; }
  };
  for (const retainedMessage of [null, undefined, false, {}, { id: undefined }, { id: null }, { id: '' }, { id: 123 }]) {
    const adapter = createRoadmapPublicationMessageMutationAdapter({ resourceSession: { ...baseSession, getRetainedMessage() { return retainedMessage; } } });
    await assert.rejects(() => adapter.edit({ messageId: 'M', payload: {} }), /retained message/);
  }
  const mismatchAdapter = createRoadmapPublicationMessageMutationAdapter({ resourceSession: { ...baseSession, getRetainedMessage() { return { id: 'M' }; } } });
  for (const messageId of ['X', undefined, null, 123, new String('M')]) {
    await assert.rejects(() => mismatchAdapter.edit({ messageId, payload: {} }), /match/);
  }
  assert.equal(editCalls, 0);
  for (const result of [null, undefined, false, {}, { id: undefined }, { id: null }, { id: '' }, { id: 42 }]) {
    const adapter = createRoadmapPublicationMessageMutationAdapter({
      resourceSession: { ...baseSession, getRetainedMessage() { return { id: 'M' }; }, async sendMessage() { return result; } }
    });
    await assert.rejects(() => adapter.send({ payload: {} }), /sent message/);
  }
  console.log('Roadmap production mutation adapter invariants passed');
})().catch((error) => { console.error(error); process.exitCode = 1; });
