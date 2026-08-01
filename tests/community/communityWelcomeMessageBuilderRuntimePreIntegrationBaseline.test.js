const assert = require('node:assert');
const cases = require('../fixtures/community/community-welcome-message-runtime-baseline.json');
const { legacyPayload } = require('../helpers/communityWelcomeMessageBuilderRuntimeHarness');

assert.equal(cases.length, 12);
for (const item of cases) {
  const payload = legacyPayload(item);
  assert.deepEqual(Object.keys(payload), ['content']);
  assert.match(payload.content, new RegExp(`https://discord\\.com/channels/${item.guildId}/${item.guideChannelId}`));
  assert.match(payload.content, /\n也可以直接使用 \/help-me-start。$/);
}
console.log('community welcome message builder runtime pre-integration baseline passed');
