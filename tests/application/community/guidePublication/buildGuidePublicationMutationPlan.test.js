const assert = require('node:assert');
const fixture = require('../../../fixtures/community/community-guide-publication-mutation-plan-cases.json');
const { createGuidePublicationMutationInput } = require('../../../../src/application/community/guidePublication/GuidePublicationMutationInput');
const { buildGuidePublicationMutationPlan } = require('../../../../src/application/community/guidePublication/buildGuidePublicationMutationPlan');

for (const item of fixture) {
  const original = structuredClone(item.input);
  const input = createGuidePublicationMutationInput(item.input);
  const plan = buildGuidePublicationMutationPlan(input);
  assert.equal(plan.operation, item.operation, item.id);
  assert.equal(plan.trackedMessageId, input.trackedMessageId, item.id);
  assert.equal(plan.shouldPersistMessageId, true, item.id);
  assert.equal(plan.persistenceIntent, 'PersistPublishedMessageId', item.id);
  assert.equal(Object.isFrozen(plan), true, item.id);
  assert.deepEqual(item.input, original, item.id);
}
console.log('build guide publication mutation plan passed');
