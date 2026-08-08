const assert = require('node:assert/strict');
const { GuidePublicationExecutionFailure } = require('../../../../src/application/community/guideExecution/GuidePublicationExecutionFailure');
const { createGuidePublicationExecutionResult } = require('../../../../src/application/community/guideExecution/GuidePublicationExecutionResult');

assert.deepEqual(GuidePublicationExecutionFailure, { EditRejected: 'EditRejected', SendRejected: 'SendRejected', Unknown: 'Unknown' });
for (const input of [
  { operation: 'EditExistingMessage', success: true, messageId: 'tracked' },
  { operation: 'SendNewMessage', success: true, messageId: 'sent' },
  { operation: 'EditExistingMessage', success: false, failureKind: GuidePublicationExecutionFailure.EditRejected },
  { operation: 'SendNewMessage', success: false, failureKind: GuidePublicationExecutionFailure.SendRejected },
  { operation: 'SendNewMessage', success: false, failureKind: GuidePublicationExecutionFailure.Unknown }
]) {
  const result = createGuidePublicationExecutionResult(input);
  assert.equal(Object.isFrozen(result), true);
  assert.equal(result.operation, input.operation);
  assert.equal(result.success, input.success);
  assert.equal(result.messageId, input.messageId);
  assert.equal(result.failureKind, input.failureKind);
}
console.log('guide publication execution result passed');
