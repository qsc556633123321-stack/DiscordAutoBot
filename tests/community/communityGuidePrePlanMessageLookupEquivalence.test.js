const assert = require('node:assert/strict');
const path = require('node:path');
const { createGuidePublicationMutationInput } = require('../../src/application/community/guidePublication/GuidePublicationMutationInput');
const { buildGuidePublicationMutationPlan } = require('../../src/application/community/guidePublication/buildGuidePublicationMutationPlan');
const cases = require(path.resolve(__dirname, '../fixtures/community/community-guide-pre-plan-message-lookup-cases.json'));

function modelLookup(item) {
  const attempted = Boolean(item.trackedId) && item.mode !== 'force';
  const available = attempted && item.lookup === 'message';
  return {
    status: !attempted ? 'LookupSkipped' : available ? 'MessageAvailable' : 'MessageUnavailable',
    count: attempted ? 1 : 0,
    args: attempted ? [item.trackedId] : [],
    existingMessageAvailable: available,
    existingMessageLookupAttempted: attempted
  };
}

assert.equal(cases.length, 30);
for (const item of cases) {
  const lookup = modelLookup(item);
  const plan = buildGuidePublicationMutationPlan(createGuidePublicationMutationInput({
    guildId: 'g',
    mode: item.mode,
    trackedMessageId: item.trackedId,
    existingMessageAvailable: lookup.existingMessageAvailable,
    existingMessageLookupAttempted: lookup.existingMessageLookupAttempted
  }));
  assert.equal(plan.operation, item.expected, item.id);
  assert.equal(lookup.status === 'MessageAvailable', lookup.existingMessageAvailable, item.id);
  assert.equal(lookup.count, lookup.existingMessageLookupAttempted ? 1 : 0, item.id);
  if (lookup.existingMessageLookupAttempted) assert.strictEqual(lookup.args[0], item.trackedId, item.id);
}
console.log('Guide pre-Plan message lookup equivalence passed');
