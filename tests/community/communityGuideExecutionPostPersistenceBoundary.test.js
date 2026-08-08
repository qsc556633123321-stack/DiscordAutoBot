const assert = require('node:assert/strict');
const cases = require('../fixtures/community/community-guide-execution-post-persistence-cases.json');
const { createGuidePublicationMutationInput, buildGuidePublicationMutationPlan, createGuidePublicationExecutionRequest } = require('../../src/application/community');

for (const item of cases) {
  const payload = { content: item.id, unknown: item.unknownPayloadField ? 'retained' : undefined };
  const input = createGuidePublicationMutationInput({
    guildId: 'guild-1',
    mode: item.mode,
    trackedMessageId: item.trackedMessageId,
    existingMessageAvailable: item.existingMessageAvailable
  });
  const plan = buildGuidePublicationMutationPlan(input);
  const request = createGuidePublicationExecutionRequest({
    operation: plan.operation,
    payload,
    trackedMessageId: plan.trackedMessageId
  });

  assert.equal(plan.operation, item.operation, item.id);
  assert.equal(request.operation, plan.operation, item.id);
  assert.equal(request.payload, payload, item.id);
  assert.equal(request.trackedMessageId, item.trackedMessageId, item.id);
  assert.equal('channel' in request, false, item.id);
  assert.equal('message' in request, false, item.id);
  assert.equal('saveOnboarding' in request, false, item.id);
}

console.log('Community Guide execution post-persistence boundary tests passed.');
