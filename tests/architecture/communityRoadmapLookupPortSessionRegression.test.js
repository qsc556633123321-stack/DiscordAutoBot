const assert = require('node:assert/strict');
const { createRoadmapPublicationResourceSession } = require('../../src/infrastructure/community/roadmapPublication/RoadmapPublicationResourceSession');

const session = createRoadmapPublicationResourceSession({ ensuredChannel: { id: 'channel', messages: { fetch: async () => null } } });
assert.deepEqual(Object.keys(session).sort(), ['getChannelId', 'getRetainedMessage', 'lookupTrackedMessage']);
assert.equal(typeof session.lookupTrackedMessage, 'function');
assert.equal(session.edit, undefined);
assert.equal(session.send, undefined);
console.log('Roadmap resource session surface remains lookup-only');
