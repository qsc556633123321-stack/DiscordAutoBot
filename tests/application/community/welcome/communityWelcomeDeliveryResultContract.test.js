const assert = require('node:assert');
const { CommunityWelcomeDeliveryFailureReason } = require('../../../../src/application/community/welcome/CommunityWelcomeDeliveryFailureReason');
const { CommunityWelcomeDeliveryStatus, createCommunityWelcomeDeliveryResult } = require('../../../../src/application/community/welcome/CommunityWelcomeDeliveryResult');

assert.deepEqual(Object.values(CommunityWelcomeDeliveryStatus), ['Delivered', 'Skipped', 'Failed']);
assert.deepEqual(Object.values(CommunityWelcomeDeliveryFailureReason), ['GuideDestinationUnavailable', 'DeliveryRejected', 'Unknown']);
for (const status of Object.values(CommunityWelcomeDeliveryStatus)) {
  const result = createCommunityWelcomeDeliveryResult(status, CommunityWelcomeDeliveryFailureReason.Unknown);
  assert.equal(Object.isFrozen(result), true);
  assert.deepEqual(result, { status, reason: 'Unknown' });
}
assert.deepEqual(createCommunityWelcomeDeliveryResult('Unexpected', 'Other'), { status: 'Unexpected', reason: 'Other' });
console.log('community welcome delivery result contract passed');
