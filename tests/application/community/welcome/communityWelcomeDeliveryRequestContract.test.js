const assert = require('node:assert');
const cases = require('../../../fixtures/community/community-welcome-delivery-cases.json');
const { createCommunityWelcomeDeliveryRequest } = require('../../../../src/application/community/welcome/CommunityWelcomeDeliveryRequest');

assert.equal(cases.length, 24);
for (const item of cases) {
  const source = { ...item };
  if (source.omitGuildId) delete source.guildId;
  if (source.omitGuideChannelId) delete source.guideChannelId;
  const before = JSON.stringify(source);
  const request = createCommunityWelcomeDeliveryRequest(source);
  assert.deepEqual(Object.keys(request), ['guildId', 'guideChannelId']);
  assert.equal(Object.isFrozen(request), true);
  assert.equal(request.guildId, source.guildId);
  assert.equal(request.guideChannelId, source.guideChannelId);
  assert.equal(JSON.stringify(source), before, 'factory must not mutate input');
}
assert.deepEqual(createCommunityWelcomeDeliveryRequest(null), { guildId: undefined, guideChannelId: undefined });
console.log('community welcome delivery request contract passed');
