const assert = require('node:assert');
const cases = require('../../../fixtures/community/community-guide-mutation-runtime-integration-preparation-cases.json');
const { createGuidePublicationMutationInput } = require('../../../../src/application/community/guidePublication/GuidePublicationMutationInput');
const { buildGuidePublicationMutationPlan } = require('../../../../src/application/community/guidePublication/buildGuidePublicationMutationPlan');

for (const item of cases) {
  const existingMessageAvailable = item.fetch === 'message';
  const input = createGuidePublicationMutationInput({
    guildId: 'guild-1',
    mode: item.mode === 'normal' ? undefined : item.mode,
    trackedMessageId: item.trackedMessageId,
    existingMessageAvailable,
    existingMessageLookupAttempted: item.fetch !== 'not-attempted'
  });
  const plan = buildGuidePublicationMutationPlan(input);
  assert.equal(plan.operation, item.operation, item.id);
  assert.equal(plan.trackedMessageId, item.trackedMessageId, item.id);
  assert.equal(Object.isFrozen(plan), true, item.id);
  assert.deepEqual(Object.keys(input), ['guildId', 'mode', 'trackedMessageId', 'existingMessageAvailable', 'existingMessageLookupAttempted'], item.id);
}
console.log('guide publication plan creation point preparation passed');
