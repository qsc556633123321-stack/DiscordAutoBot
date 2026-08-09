const assert = require('node:assert/strict');
const { createFakeCommunityRoadmapMutationPort } = require('../../fakes/community/FakeCommunityRoadmapMutationPort');

(async () => {
  for (const failure of [new Error('edit'), 'string', 17, { reason: 'object' }, null, undefined]) {
    const port = createFakeCommunityRoadmapMutationPort({ editRejection: failure });
    await assert.rejects(() => port.edit({ messageId: 'M', payload: {} }), (received) => received === failure);
  }
  for (const failure of [new Error('send'), 'string', 29, { reason: 'object' }, null, undefined]) {
    const port = createFakeCommunityRoadmapMutationPort({ sendRejection: failure });
    await assert.rejects(() => port.send({ payload: {} }), (received) => received === failure);
  }
  console.log('Roadmap mutation Port candidate reserves exact raw rejection propagation for a future adapter/session handoff');
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
