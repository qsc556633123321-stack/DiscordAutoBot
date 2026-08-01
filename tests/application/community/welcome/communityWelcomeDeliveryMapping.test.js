const assert = require('node:assert');
const { mapLegacyWelcomeDeliveryRequest } = require('../../../../src/application/community/welcome/mapLegacyWelcomeDeliveryRequest');
const { buildCommunityWelcomeMessage } = require('../../../../src/application/community/welcome/buildCommunityWelcomeMessage');

const legacy = { guildId: 'guild-1', guideChannelId: 'guide-1', unknown: { keep: true } };
const request = mapLegacyWelcomeDeliveryRequest(legacy);
assert.deepEqual(request, { guildId: 'guild-1', guideChannelId: 'guide-1' });
assert.equal(Object.isFrozen(request), true);
assert.deepEqual(legacy, { guildId: 'guild-1', guideChannelId: 'guide-1', unknown: { keep: true } });
assert.deepEqual(buildCommunityWelcomeMessage(request, { guildName: '科幻基地' }), {
  content: '歡迎加入 科幻基地。如果你不知道從哪裡開始，可以先看這個互動導覽：https://discord.com/channels/guild-1/guide-1\n也可以直接使用 /help-me-start。'
});
assert.deepEqual(mapLegacyWelcomeDeliveryRequest({ guildId: 1, guideChannelId: false }), { guildId: 1, guideChannelId: false });
console.log('community welcome delivery mapping passed');
