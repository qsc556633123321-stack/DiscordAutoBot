const assert = require('node:assert');
const cases = require('../fixtures/community/community-guide-mutation-runtime-integration-preparation-cases.json');
const { createGuidePublicationMutationInput } = require('../../src/application/community/guidePublication/GuidePublicationMutationInput');
const { buildGuidePublicationMutationPlan } = require('../../src/application/community/guidePublication/buildGuidePublicationMutationPlan');

function legacyBranch({ mode, existingMessageAvailable }) {
  return mode !== 'force' && existingMessageAvailable ? 'EditExistingMessage' : 'SendNewMessage';
}
for (const item of cases) {
  const shouldFetch = Boolean(item.trackedMessageId) && item.mode !== 'force';
  const input = createGuidePublicationMutationInput({
    mode: item.mode === 'normal' ? undefined : item.mode,
    trackedMessageId: item.trackedMessageId,
    existingMessageAvailable: shouldFetch && item.fetch === 'message'
  });
  const plan = buildGuidePublicationMutationPlan(input);
  assert.equal(plan.operation, legacyBranch(input), item.id);
  assert.equal(plan.operation, item.operation, item.id);
}
console.log('community Guide mutation branch replacement equivalence passed');
