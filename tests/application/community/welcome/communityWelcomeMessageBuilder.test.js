const assert = require('node:assert');
const cases = require('../../../fixtures/community/community-welcome-delivery-cases.json');
const { createCommunityWelcomeDeliveryRequest } = require('../../../../src/application/community/welcome/CommunityWelcomeDeliveryRequest');
const { buildCommunityWelcomeMessage } = require('../../../../src/application/community/welcome/buildCommunityWelcomeMessage');

const expected = '歡迎加入 科幻基地。如果你不知道從哪裡開始，可以先看這個互動導覽：https://discord.com/channels/guild-1/guide-1\n也可以直接使用 /help-me-start。';
const request = createCommunityWelcomeDeliveryRequest(cases[0]);
const payload = buildCommunityWelcomeMessage(request, { guildName: cases[0].guildName });
assert.deepEqual(payload, { content: expected });
assert.equal(Object.isFrozen(payload), true);
assert.equal(Object.keys(payload).length, 1);
assert.equal(buildCommunityWelcomeMessage(request, { guildName: '科幻基地' }).content, expected);

for (const item of cases.slice(1, 15)) {
  const input = { ...item };
  if (input.omitGuildId) delete input.guildId;
  if (input.omitGuideChannelId) delete input.guideChannelId;
  const malformed = createCommunityWelcomeDeliveryRequest(input);
  const output = buildCommunityWelcomeMessage(malformed, { guildName: item.guildName });
  assert.equal(typeof output.content, 'string');
  assert.match(output.content, /^歡迎加入 /);
}
assert.match(payload.content, /https:\/\/discord\.com\/channels\/guild-1\/guide-1/);
assert.match(payload.content, /\n也可以直接使用 \/help-me-start。$/);
console.log('community welcome delivery message builder passed');
