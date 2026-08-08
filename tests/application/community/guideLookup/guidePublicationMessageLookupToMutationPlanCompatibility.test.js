const assert = require('node:assert/strict');
const path = require('node:path');
const cases = require(path.resolve(__dirname, '../../../fixtures/community/community-guide-pre-plan-message-lookup-cases.json'));
const { GuidePublicationMessageLookupStatus } = require('../../../../src/application/community/guideLookup/GuidePublicationMessageLookupStatus');
const { createGuidePublicationMutationInput } = require('../../../../src/application/community/guidePublication/GuidePublicationMutationInput');
const { buildGuidePublicationMutationPlan } = require('../../../../src/application/community/guidePublication/buildGuidePublicationMutationPlan');

for (const item of cases) {
  const attempted = Boolean(item.trackedId) && item.mode !== 'force';
  const status = !attempted ? GuidePublicationMessageLookupStatus.LookupSkipped : item.lookup === 'message'
    ? GuidePublicationMessageLookupStatus.MessageAvailable : GuidePublicationMessageLookupStatus.MessageUnavailable;
  const plan = buildGuidePublicationMutationPlan(createGuidePublicationMutationInput({
    guildId: 'g',
    mode: item.mode,
    trackedMessageId: item.trackedId,
    existingMessageAvailable: status === GuidePublicationMessageLookupStatus.MessageAvailable,
    existingMessageLookupAttempted: attempted
  }));
  assert.equal(plan.operation, item.expected, item.id);
}
console.log('Guide publication message lookup Plan mapping compatibility passed');
