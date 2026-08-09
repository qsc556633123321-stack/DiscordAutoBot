const assert = require('node:assert/strict');
const { createRoadmapPublicationResourceSession } = require('../../../src/infrastructure/community/roadmapPublication/RoadmapPublicationResourceSession');
const { createRoadmapPublicationMessageLookupAdapter } = require('../../../src/infrastructure/community/roadmapPublication/RoadmapPublicationMessageLookupAdapter');

(async () => {
  for (const rejection of [new Error('error'), 'error', 9, {}, null, undefined]) {
    let fetches = 0;
    const session = createRoadmapPublicationResourceSession({
      ensuredChannel: { id: 'channel', messages: { fetch: async () => { fetches += 1; return Promise.reject(rejection); } }, send: async () => ({ id: 'sent' }) }
    });
    const adapter = createRoadmapPublicationMessageLookupAdapter({ resourceSession: session });
    assert.deepEqual(await adapter.lookupTrackedMessage({ messageId: 'tracked' }), { kind: 'Unavailable' });
    assert.equal(fetches, 1);
  }
  console.log('Roadmap production lookup adapter preserves rejection swallow');
})().catch((error) => { console.error(error); process.exitCode = 1; });
