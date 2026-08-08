function createGuidePublicationExecutionResult(input = {}) {
  return Object.freeze({
    operation: input.operation,
    success: input.success === true,
    messageId: input.messageId,
    failureKind: input.failureKind
  });
}

module.exports = { createGuidePublicationExecutionResult };
