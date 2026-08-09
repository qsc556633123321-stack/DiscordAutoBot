const assert = require('node:assert/strict');
const { createRoadmapPublicationResourceSession } = require('../../../src/infrastructure/community/roadmapPublication/RoadmapPublicationResourceSession');
const {
  createRoadmapPublicationMessageLookupRequest,
  createRoadmapPublicationMessageAvailable,
  createRoadmapPublicationMessageUnavailable
} = require('../../../src/application/community/roadmapPublication/RoadmapPublicationMessageLookupPort');

async function mapLookup(session, request) {
  const result = await session.lookupTrackedMessage(request.messageId);
  return result.kind === 'Available'
    ? createRoadmapPublicationMessageAvailable(request)
    : createRoadmapPublicationMessageUnavailable();
}

(async () => {
  const message = { id: 'message-id' };
  let fetches = 0;
  const availableSession = createRoadmapPublicationResourceSession({
    ensuredChannel: { id: 'channel-id', messages: { fetch: async () => { fetches += 1; return message; } }, send: async () => ({ id: 'sent' }) }
  });
  const request = createRoadmapPublicationMessageLookupRequest({ messageId: 'message-id' });
  assert.deepEqual(await mapLookup(availableSession, request), { kind: 'Available', messageId: 'message-id' });
  assert.equal(availableSession.getRetainedMessage(), message);
  assert.equal(fetches, 1);

  for (const messageId of [undefined, null, '', 0, false]) {
    const session = createRoadmapPublicationResourceSession({
      ensuredChannel: { id: 'channel-id', messages: { fetch: async () => { throw new Error('must not fetch'); } }, send: async () => ({ id: 'sent' }) }
    });
    assert.deepEqual(await mapLookup(session, createRoadmapPublicationMessageLookupRequest({ messageId })), { kind: 'Unavailable' });
  }

  for (const rejection of [new Error('error'), 'error', 1, {}, null, undefined]) {
    const session = createRoadmapPublicationResourceSession({
      ensuredChannel: { id: 'channel-id', messages: { fetch: async () => Promise.reject(rejection) }, send: async () => ({ id: 'sent' }) }
    });
    assert.deepEqual(await mapLookup(session, createRoadmapPublicationMessageLookupRequest({ messageId: 'tracked' })), { kind: 'Unavailable' });
  }
  console.log('Roadmap lookup port/session compatibility passed');
})().catch((error) => { console.error(error); process.exitCode = 1; });
