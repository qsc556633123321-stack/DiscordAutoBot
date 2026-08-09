const assert = require('node:assert/strict');
const { createRoadmapPublicationResourceSession } = require('../../../src/infrastructure/community/roadmapPublication/RoadmapPublicationResourceSession');
const { createRoadmapPublicationMessageLookupAdapter } = require('../../../src/infrastructure/community/roadmapPublication/RoadmapPublicationMessageLookupAdapter');

(async () => {
  const message = { id: 'message-id' };
  let fetches = 0;
  const session = createRoadmapPublicationResourceSession({
    ensuredChannel: { id: 'channel-id', messages: { fetch: async () => { fetches += 1; return message; } }, send: async () => ({ id: 'sent' }) }
  });
  const adapter = createRoadmapPublicationMessageLookupAdapter({ resourceSession: session });
  assert.deepEqual(await adapter.lookupTrackedMessage({ messageId: 'message-id' }), { kind: 'Available', messageId: 'message-id' });
  assert.equal(session.getRetainedMessage(), message);
  assert.equal(fetches, 1);

  const rejectionSession = createRoadmapPublicationResourceSession({
    ensuredChannel: { id: 'channel-id', messages: { fetch: async () => Promise.reject('rejected') }, send: async () => ({ id: 'sent' }) }
  });
  const rejectionAdapter = createRoadmapPublicationMessageLookupAdapter({ resourceSession: rejectionSession });
  assert.deepEqual(await rejectionAdapter.lookupTrackedMessage({ messageId: 'message-id' }), { kind: 'Unavailable' });
  assert.equal(rejectionSession.getRetainedMessage(), null);
  console.log('Roadmap production lookup adapter integration passed');
})().catch((error) => { console.error(error); process.exitCode = 1; });
