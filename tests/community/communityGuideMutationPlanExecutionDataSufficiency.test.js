const assert = require('node:assert');
const { createGuidePublicationMutationInput } = require('../../src/application/community/guidePublication/GuidePublicationMutationInput');
const { buildGuidePublicationMutationPlan } = require('../../src/application/community/guidePublication/buildGuidePublicationMutationPlan');

const input = createGuidePublicationMutationInput({ guildId: 'guild-1', mode: 'force', trackedMessageId: 'guide-1', existingMessageAvailable: true });
const plan = buildGuidePublicationMutationPlan(input);
assert.deepEqual(plan, { operation: 'SendNewMessage', trackedMessageId: 'guide-1', shouldPersistMessageId: true, persistenceIntent: 'PersistPublishedMessageId' });
for (const forbidden of ['channel', 'message', 'interaction', 'payload', 'onboardingData', 'saveOnboarding']) assert.equal(forbidden in input, false, forbidden);
console.log('community Guide mutation plan execution data sufficiency passed');
