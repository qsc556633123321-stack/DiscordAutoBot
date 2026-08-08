const assert = require('node:assert/strict');
const { createGuidePublicationExecutionRequest, createGuidePublicationExecutionResult } = require('../../../../src/application/community');

const request = createGuidePublicationExecutionRequest({ operation: 'SendNewMessage', payload: { content: 'Guide' } });
const result = createGuidePublicationExecutionResult({ operation: request.operation, success: true, messageId: 'sent' });
for (const value of [request, result]) {
  for (const key of ['saveOnboarding', 'onboarding', 'roadmap', 'jsonPath', 'write', 'retry', 'rollback']) assert.equal(key in value, false, key);
}
assert.equal(result.success, true);
assert.equal(result.messageId, 'sent');
console.log('guide publication execution persistence separation passed');
