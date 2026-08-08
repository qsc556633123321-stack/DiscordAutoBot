const assert = require('node:assert/strict');
const { createGuidePublicationMessageMutationDiscordAdapter } = require('../../../../src/infrastructure/community/guidePublication/GuidePublicationMessageMutationDiscordAdapter');

(async () => {
  const first = []; const second = [];
  const a = createGuidePublicationMessageMutationDiscordAdapter({ session: { async editTrackedMessage(payload) { first.push(payload); }, async sendMessage() { return { id: 'a' }; } } });
  const b = createGuidePublicationMessageMutationDiscordAdapter({ session: { async editTrackedMessage(payload) { second.push(payload); }, async sendMessage() { return { id: 'b' }; } } });
  await a.edit({ messageId: 'a', payload: { a: true } }); await b.edit({ messageId: 'b', payload: { b: true } });
  assert.deepEqual(first, [{ a: true }]); assert.deepEqual(second, [{ b: true }]);
  console.log('Guide production mutation adapter isolation passed');
})().catch((error) => { console.error(error); process.exitCode = 1; });
