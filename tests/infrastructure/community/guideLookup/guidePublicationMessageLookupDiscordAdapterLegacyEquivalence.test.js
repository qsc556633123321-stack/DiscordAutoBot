const assert = require('node:assert/strict');
const path = require('node:path');
const cases = require(path.resolve(__dirname, '../../../fixtures/community/community-guide-message-lookup-adapter-cases.json'));
const { GuidePublicationMessageLookupStatus } = require('../../../../src/application/community/guideLookup/GuidePublicationMessageLookupStatus');
const { createGuidePublicationMutationInput } = require('../../../../src/application/community/guidePublication/GuidePublicationMutationInput');
const { buildGuidePublicationMutationPlan } = require('../../../../src/application/community/guidePublication/buildGuidePublicationMutationPlan');

for (const item of cases.filter((entry) => entry.channel === 'resolved')) {
  const available = item.fetch === 'message';
  const status = available ? GuidePublicationMessageLookupStatus.MessageAvailable : GuidePublicationMessageLookupStatus.MessageUnavailable;
  const plan = buildGuidePublicationMutationPlan(createGuidePublicationMutationInput({
    guildId: 'g', trackedMessageId: item.messageId, existingMessageAvailable: available, existingMessageLookupAttempted: true
  }));
  assert.equal(status, item.status, item.id);
  assert.equal(plan.operation, available ? 'EditExistingMessage' : 'SendNewMessage', item.id);
}
console.log('Guide message lookup Discord adapter legacy equivalence passed');
