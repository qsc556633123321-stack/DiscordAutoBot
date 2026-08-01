const assert = require('node:assert');
const fixture = require('../../../fixtures/community/community-guide-publication-mutation-plan-cases.json');
const { createGuidePublicationMutationInput } = require('../../../../src/application/community/guidePublication/GuidePublicationMutationInput');
const { buildGuidePublicationMutationPlan } = require('../../../../src/application/community/guidePublication/buildGuidePublicationMutationPlan');

function legacyDecision(input) {
  return input.mode !== 'force' && input.existingMessageAvailable ? 'EditExistingMessage' : 'SendNewMessage';
}

for (const item of fixture) {
  const input = createGuidePublicationMutationInput(item.input);
  const first = buildGuidePublicationMutationPlan(input);
  const second = buildGuidePublicationMutationPlan(input);
  assert.equal(first.operation, legacyDecision(input), item.id);
  assert.equal(first.operation, item.operation, item.id);
  assert.deepEqual(first, second, item.id);
}
console.log('guide publication mutation plan differential compatibility passed');
