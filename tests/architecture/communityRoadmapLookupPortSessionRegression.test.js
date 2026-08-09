const assert = require('node:assert/strict');
const { createRoadmapPublicationResourceSession } = require('../../src/infrastructure/community/roadmapPublication/RoadmapPublicationResourceSession');

const session = createRoadmapPublicationResourceSession({ ensuredChannel: { id: 'channel', messages: { fetch: async () => null }, send: async () => ({ id: 'sent' }) } });
assert.deepEqual(Object.keys(session).sort(), ['editTrackedMessage', 'getChannelId', 'getRetainedMessage', 'getRetainedMutationFailure', 'lookupTrackedMessage', 'sendMessage']);
assert.equal(typeof session.lookupTrackedMessage, 'function');
assert.equal(session.edit, undefined);
assert.equal(session.send, undefined);
console.log('Roadmap resource session preserves lookup compatibility with its approved mutation extension');
