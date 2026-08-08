const assert = require('node:assert/strict');
const { buildGuidePublicationMutationPlan } = require('../../../../src/application/community/guidePublication/buildGuidePublicationMutationPlan');
const { createGuidePublicationMutationInput } = require('../../../../src/application/community/guidePublication/GuidePublicationMutationInput');
const { GuidePublicationOperationType } = require('../../../../src/application/community/guidePublication/GuidePublicationOperationType');
const { createGuidePublicationMessageEditRequest } = require('../../../../src/application/community/guideDiscordMutation/GuidePublicationMessageEditRequest');

const legacyAfterFetchFailure = buildGuidePublicationMutationPlan(createGuidePublicationMutationInput({
  guildId: 'g',
  trackedMessageId: 'malformed-but-truthy',
  existingMessageAvailable: false,
  existingMessageLookupAttempted: true
}));
assert.equal(legacyAfterFetchFailure.operation, GuidePublicationOperationType.SendNewMessage);

const futureEdit = createGuidePublicationMessageEditRequest({
  guildId: 'g', channelId: 'c', messageId: 'malformed-but-truthy', payload: { embeds: [] }
});
assert.equal(futureEdit.messageId, 'malformed-but-truthy');
assert.equal('operation' in futureEdit, false);
assert.equal('fallbackToSend' in futureEdit, false);
console.log('Guide publication message mutation adapter semantic mismatch characterized');
