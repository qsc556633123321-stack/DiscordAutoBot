const assert = require('node:assert/strict');
const { createFakeCommunityRoadmapMutationResourceSession } = require('../../fakes/community/FakeCommunityRoadmapMutationResourceSession');
const { createRoadmapPublicationMessageEditSuccess, createRoadmapPublicationMessageSendSuccess } = require('../../../src/application/community/roadmapPublication/RoadmapPublicationMessageMutationPort');

(async () => {
  const message = { id: 'M', async edit() { return { id: 'E' }; } };
  const sent = { id: 'S' };
  const channel = { id: 'C', messages: { async fetch() { return message; } }, async send() { return sent; } };
  const session = createFakeCommunityRoadmapMutationResourceSession({ ensuredChannel: channel });
  await session.lookupTrackedMessage('M');
  await session.editTrackedMessage({});
  assert.deepEqual(createRoadmapPublicationMessageEditSuccess({ messageId: session.getRetainedMessage().id }), { kind: 'EditSuccess', messageId: 'M' });
  await session.sendMessage({});
  assert.deepEqual(createRoadmapPublicationMessageSendSuccess({ messageId: session.getRetainedMessage().id }), { kind: 'SendSuccess', messageId: 'S' });
  console.log('Roadmap mutation Resource Session candidate is compatible with Application Port ID semantics');
})().catch((error) => { console.error(error); process.exitCode = 1; });
