function createGuidePublicationMutationPlan({ operation, trackedMessageId, shouldPersistMessageId, persistenceIntent }) {
  return Object.freeze({ operation, trackedMessageId, shouldPersistMessageId, persistenceIntent });
}

module.exports = { createGuidePublicationMutationPlan };
