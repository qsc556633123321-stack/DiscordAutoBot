const assert = require('node:assert');
const cases = require('../fixtures/community/community-guide-mutation-runtime-integration-preparation-cases.json');
const { createGuidePublicationMutationInput } = require('../../src/application/community/guidePublication/GuidePublicationMutationInput');
const { buildGuidePublicationMutationPlan } = require('../../src/application/community/guidePublication/buildGuidePublicationMutationPlan');

for (const item of cases) {
  const shouldFetch = Boolean(item.trackedMessageId) && item.mode !== 'force';
  const existingMessageAvailable = shouldFetch && item.fetch === 'message';
  const plan = buildGuidePublicationMutationPlan(createGuidePublicationMutationInput({
    guildId: 'guild-1', mode: item.mode === 'normal' ? undefined : item.mode,
    trackedMessageId: item.trackedMessageId, existingMessageAvailable,
    existingMessageLookupAttempted: shouldFetch
  }));
  assert.equal(plan.operation, item.operation, item.id);
  assert.equal(shouldFetch, item.fetch !== 'not-attempted', item.id);
}
console.log('community Guide mutation plan creation point preparation passed');
