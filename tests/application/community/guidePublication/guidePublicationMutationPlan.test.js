const assert = require('node:assert');
const { createGuidePublicationMutationPlan } = require('../../../../src/application/community/guidePublication/GuidePublicationMutationPlan');
const { GuidePublicationOperationType } = require('../../../../src/application/community/guidePublication/GuidePublicationOperationType');

assert.deepEqual(Object.values(GuidePublicationOperationType), ['EditExistingMessage', 'SendNewMessage', 'Skip']);
const plan = createGuidePublicationMutationPlan({ operation: GuidePublicationOperationType.SendNewMessage, trackedMessageId: null, shouldPersistMessageId: true, persistenceIntent: 'PersistPublishedMessageId' });
assert.equal(Object.isFrozen(plan), true);
assert.deepEqual(plan, { operation: 'SendNewMessage', trackedMessageId: null, shouldPersistMessageId: true, persistenceIntent: 'PersistPublishedMessageId' });
console.log('guide publication mutation plan passed');
