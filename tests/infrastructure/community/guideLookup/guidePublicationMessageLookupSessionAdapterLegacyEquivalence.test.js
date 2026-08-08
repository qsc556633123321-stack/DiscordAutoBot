const assert = require('node:assert/strict');
const path = require('node:path');
const cases = require(path.resolve(__dirname, '../../../fixtures/community/community-guide-lookup-adapter-session-cases.json'));
const { createFakeGuidePublicationMessageLookupSessionAdapter } = require('../../../fakes/community/FakeGuidePublicationMessageLookupSessionAdapter');

(async () => {
  assert.equal(cases.length, 40);
  for (const item of cases) {
    const calls = [];
    const adapter = createFakeGuidePublicationMessageLookupSessionAdapter({
      session: {
        async lookupTrackedMessage(id) {
          calls.push(id);
          if (item.rejected) throw new Error('legacy fetch rejection');
          return { available: Boolean(item.available) };
        }
      }
    });
    const result = await adapter.lookup({ guildId: 'g', channelId: 'c', messageId: item.input });
    assert.strictEqual(calls[0], item.input, item.id);
    assert.equal(result.status, item.status, item.id);
    assert.strictEqual(result.messageId, item.input, item.id);
  }
  console.log('Guide lookup adapter session legacy equivalence preparation passed');
})().catch((error) => { console.error(error); process.exitCode = 1; });
