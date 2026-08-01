function createGuidePublicationMutationInput(input = {}) {
  return Object.freeze({
    guildId: input.guildId,
    mode: input.mode,
    trackedMessageId: input.trackedMessageId,
    existingMessageAvailable: input.existingMessageAvailable === true,
    existingMessageLookupAttempted: input.existingMessageLookupAttempted === true
  });
}

module.exports = { createGuidePublicationMutationInput };
