const assert = require('node:assert/strict');
const { createFakeGuidePublicationAdapterPairWithMessageHandoff } = require('../../fakes/community/FakeGuidePublicationAdapterPairWithMessageHandoff');

let fetches = 0;
const message = { id: 'm' };
let retained = null;
const pair = createFakeGuidePublicationAdapterPairWithMessageHandoff({
  session: { getRetainedMessage() { return retained; } },
  lookupPort: { async lookup() { fetches += 1; retained = message; return { status: 'MessageAvailable', messageId: 'm' }; } }, mutationPort: {}
});
(async () => {
  await pair.lookupPort.lookup({ guildId: 'guild', channelId: 'channel', messageId: 'm' });
  assert.strictEqual(pair.getRetainedMessage(), message);
  assert.equal(fetches, 1);
  assert.strictEqual(pair.getRetainedMessage(), message);
  assert.equal(fetches, 1, 'repeated getter calls cannot fetch');
  console.log('Community guide Pair retained-message no-second-fetch candidate passed');
})().catch((error) => { console.error(error); process.exitCode = 1; });
