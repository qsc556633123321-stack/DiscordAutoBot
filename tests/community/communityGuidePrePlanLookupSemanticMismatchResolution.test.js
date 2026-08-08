const assert = require('node:assert/strict');
const { createGuidePublicationMutationInput } = require('../../src/application/community/guidePublication/GuidePublicationMutationInput');
const { buildGuidePublicationMutationPlan } = require('../../src/application/community/guidePublication/buildGuidePublicationMutationPlan');
const { GuidePublicationOperationType } = require('../../src/application/community/guidePublication/GuidePublicationOperationType');

const unavailableBeforePlan = buildGuidePublicationMutationPlan(createGuidePublicationMutationInput({
  guildId: 'g', trackedMessageId: 'm', existingMessageAvailable: false, existingMessageLookupAttempted: true
}));
assert.equal(unavailableBeforePlan.operation, GuidePublicationOperationType.SendNewMessage);
assert.equal(unavailableBeforePlan.operation === GuidePublicationOperationType.EditExistingMessage, false);
console.log('Guide pre-Plan lookup semantic mismatch resolution passed');
