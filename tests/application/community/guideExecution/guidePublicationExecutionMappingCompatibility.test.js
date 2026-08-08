const assert = require('node:assert/strict');
const cases = require('../../../fixtures/community/community-guide-discord-execution-contract-cases.json');
const { createGuidePublicationExecutionRequest, createGuidePublicationExecutionResult } = require('../../../../src/application/community');

for (const item of cases) {
  const request = createGuidePublicationExecutionRequest({ operation: item.operation, payload: { content: item.id }, trackedMessageId: item.trackedMessageId });
  assert.equal(request.operation, item.operation, item.id);
  assert.equal(request.trackedMessageId, item.trackedMessageId, item.id);
  if ('success' in item) {
    const result = createGuidePublicationExecutionResult(item);
    assert.equal(result.success, item.success, item.id);
    assert.equal(result.messageId, item.messageId, item.id);
    assert.equal(result.failureKind, item.failureKind, item.id);
  }
}
console.log('guide publication execution mapping compatibility passed');
