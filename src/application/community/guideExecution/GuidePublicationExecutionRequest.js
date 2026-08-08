function createGuidePublicationExecutionRequest(input = {}) {
  if (!input.operation) throw new TypeError('Guide publication execution operation is required');
  return Object.freeze({
    operation: input.operation,
    payload: input.payload,
    trackedMessageId: input.trackedMessageId
  });
}

module.exports = { createGuidePublicationExecutionRequest };
