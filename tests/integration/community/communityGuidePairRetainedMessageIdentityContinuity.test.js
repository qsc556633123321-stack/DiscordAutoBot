const assert = require('node:assert/strict');
const { createFakeGuidePublicationAdapterPairWithMessageHandoff } = require('../../fakes/community/FakeGuidePublicationAdapterPairWithMessageHandoff');

const message = { id: 'exact', async edit() {} };
let fetches = 0;
let retained = null;
const lookupPort = { async lookup() { fetches += 1; retained = message; return { status: 'MessageAvailable', messageId: message.id }; } };
const pair = createFakeGuidePublicationAdapterPairWithMessageHandoff({ session: { getRetainedMessage() { return retained; } }, lookupPort, mutationPort: {} });
(async () => {
  await pair.lookupPort.lookup({ guildId: 'guild', channelId: 'channel', messageId: message.id });
  const runtimeMessage = pair.getRetainedMessage();
  assert.strictEqual(runtimeMessage, message);
  await runtimeMessage.edit({});
  assert.equal(fetches, 1, 'legacy edit must reuse the exact retained lookup identity');
  console.log('Community guide Pair retained-message identity continuity candidate passed');
})().catch((error) => { console.error(error); process.exitCode = 1; });
