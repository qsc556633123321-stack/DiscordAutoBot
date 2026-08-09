const assert = require('node:assert/strict');
const { createRoadmapPublicationResourceSession } = require('../../../src/infrastructure/community/roadmapPublication/RoadmapPublicationResourceSession');
const { createFakeCommunityRoadmapLookupAdapter } = require('../../fakes/community/FakeCommunityRoadmapLookupAdapter');

(async () => {
  let fetches = 0;
  const message = { id: 'roadmap-message' };
  const session = createRoadmapPublicationResourceSession({
    ensuredChannel: { id: 'roadmap-channel', messages: { fetch: async () => { fetches += 1; return message; } }, send: async () => ({ id: 'sent' }) }
  });
  const adapter = createFakeCommunityRoadmapLookupAdapter({ session });

  assert.equal(session.getChannelId(), 'roadmap-channel');
  assert.equal(session.getRetainedMessage(), null);
  assert.equal(fetches, 0);
  assert.deepEqual(await adapter.lookupTrackedMessage({ messageId: false }), { kind: 'Unavailable' });
  assert.equal(fetches, 0);
  assert.deepEqual(await adapter.lookupTrackedMessage({ messageId: 'roadmap-message' }), { kind: 'Available', messageId: 'roadmap-message' });
  assert.equal(fetches, 1);
  assert.equal(session.getRetainedMessage(), message);
  console.log('Roadmap lookup port no extra I/O passed');
})().catch((error) => { console.error(error); process.exitCode = 1; });
