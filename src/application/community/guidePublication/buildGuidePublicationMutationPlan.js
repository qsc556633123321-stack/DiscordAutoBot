const { GuidePublicationOperationType } = require('./GuidePublicationOperationType');
const { createGuidePublicationMutationPlan } = require('./GuidePublicationMutationPlan');

function buildGuidePublicationMutationPlan(input) {
  const operation = input.mode !== 'force' && input.existingMessageAvailable
    ? GuidePublicationOperationType.EditExistingMessage
    : GuidePublicationOperationType.SendNewMessage;
  return createGuidePublicationMutationPlan({
    operation,
    trackedMessageId: input.trackedMessageId,
    shouldPersistMessageId: true,
    persistenceIntent: 'PersistPublishedMessageId'
  });
}

module.exports = { buildGuidePublicationMutationPlan };
