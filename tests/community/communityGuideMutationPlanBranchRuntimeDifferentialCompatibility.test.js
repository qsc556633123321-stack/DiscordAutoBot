const assert = require('node:assert/strict');
const cases = require('../fixtures/community/community-guide-mutation-runtime-integration-preparation-cases.json');
const { createGuidePublicationMutationInput, buildGuidePublicationMutationPlan } = require('../../src/application/community');

for (const item of cases) {
  const fetched = item.mode !== 'force' && Boolean(item.trackedMessageId) && item.fetch === 'message';
  const plan = buildGuidePublicationMutationPlan(createGuidePublicationMutationInput({ mode: item.mode === 'normal' ? undefined : item.mode, trackedMessageId: item.trackedMessageId, existingMessageAvailable: fetched }));
  const legacy = fetched && item.mode !== 'force' ? 'EditExistingMessage' : 'SendNewMessage';
  assert.equal(plan.operation, legacy, item.id);
  assert.equal(plan.operation, item.operation, item.id);
}
console.log('community Guide mutation Plan branch runtime differential compatibility passed');
