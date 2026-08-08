const assert = require('node:assert/strict');
const { createFakeGuidePublicationMessageMutationSessionAdapter } = require('../../../fakes/community/FakeGuidePublicationMessageMutationSessionAdapter');

(async () => {
  const first = []; const second = [];
  const a = createFakeGuidePublicationMessageMutationSessionAdapter({ session: { async editTrackedMessage(payload) { first.push(payload); }, async sendMessage() { return { id: 'a' }; } } });
  const b = createFakeGuidePublicationMessageMutationSessionAdapter({ session: { async editTrackedMessage(payload) { second.push(payload); }, async sendMessage() { return { id: 'b' }; } } });
  await a.edit({ messageId: 'a', payload: { a: true } });
  await b.edit({ messageId: 'b', payload: { b: true } });
  assert.deepEqual(first, [{ a: true }]);
  assert.deepEqual(second, [{ b: true }]);
  console.log('Guide mutation adapter session isolation preparation passed');
})().catch((error) => { console.error(error); process.exitCode = 1; });
