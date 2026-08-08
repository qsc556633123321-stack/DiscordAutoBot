const assert = require('node:assert/strict');
const path = require('node:path');
const cases = require(path.resolve(__dirname, '../../../fixtures/community/community-guide-lookup-adapter-session-cases.json'));
const { createGuidePublicationMessageLookupDiscordAdapter } = require('../../../../src/infrastructure/community/guidePublication/GuidePublicationMessageLookupDiscordAdapter');

(async () => {
  assert.equal(cases.length, 40);
  for (const item of cases) {
    const calls = [];
    const adapter = createGuidePublicationMessageLookupDiscordAdapter({
      session: {
        async lookupTrackedMessage(id) {
          calls.push(id);
          if (item.rejected) throw new Error('legacy caught rejection');
          return { available: Boolean(item.available) };
        }
      }
    });
    const result = await adapter.lookup({ guildId: 'g', channelId: 'c', messageId: item.input });
    assert.strictEqual(calls[0], item.input, item.id);
    assert.equal(result.status, item.status, item.id);
    assert.strictEqual(result.messageId, item.input, item.id);
  }
  console.log('Guide production lookup Discord adapter compatibility passed');
})().catch((error) => { console.error(error); process.exitCode = 1; });
