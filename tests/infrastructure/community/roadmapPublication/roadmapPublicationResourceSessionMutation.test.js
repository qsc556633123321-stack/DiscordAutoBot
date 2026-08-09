const assert = require('node:assert/strict');
const { createRoadmapPublicationResourceSession } = require('../../../../src/infrastructure/community/roadmapPublication/RoadmapPublicationResourceSession');

(async () => {
  const payload = { embeds: [{ title: 'Roadmap' }] };
  const editResult = { id: 'E' };
  const message = { id: 'M', async edit(input) { assert.equal(input, payload); return editResult; } };
  const sent = { id: 'S' };
  const channel = {
    id: 'C',
    messages: { async fetch() { return message; } },
    async send(input) { assert.equal(input, payload); return sent; }
  };
  const session = createRoadmapPublicationResourceSession({ ensuredChannel: channel });

  assert.equal(session.getRetainedMessage(), null);
  assert.deepEqual(session.getRetainedMutationFailure(), { hasFailure: false });
  await session.lookupTrackedMessage('M');
  assert.equal(await session.editTrackedMessage(payload), editResult);
  assert.equal(session.getRetainedMessage(), message);
  assert.equal(await session.sendMessage(payload), sent);
  assert.equal(session.getRetainedMessage(), sent);
  assert.throws(
    () => createRoadmapPublicationResourceSession({ ensuredChannel: { id: 'C', messages: { fetch() {} } } }),
    /messages\.fetch and send/
  );
  console.log('Roadmap Resource Session mutation success identity passed');
})().catch((error) => { console.error(error); process.exitCode = 1; });
