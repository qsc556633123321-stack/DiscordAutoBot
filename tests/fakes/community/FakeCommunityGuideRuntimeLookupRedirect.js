const { GuidePublicationMessageLookupStatus } = require('../../../src/application/community/guideLookup/GuidePublicationMessageLookupStatus');

function createFakeCommunityGuideRuntimeLookupRedirect({ lookupPort, getRetainedMessage, buildPlan, legacyMutation } = {}) {
  if (!lookupPort || typeof lookupPort.lookup !== 'function') throw new TypeError('lookupPort is required');
  if (typeof getRetainedMessage !== 'function') throw new TypeError('getRetainedMessage is required');
  if (typeof buildPlan !== 'function') throw new TypeError('buildPlan is required');
  if (!legacyMutation) throw new TypeError('legacyMutation is required');

  return {
    async publish({ mode, messageId, payload }) {
      let message = null;
      let lookupResult = null;
      if (messageId && mode !== 'force') {
        lookupResult = await lookupPort.lookup({ messageId });
        if (lookupResult.status === GuidePublicationMessageLookupStatus.MessageAvailable) {
          message = getRetainedMessage();
        }
      }

      const plan = buildPlan({ mode, messageId, existingMessageAvailable: Boolean(message) });
      if (plan.operation === 'EditExistingMessage') await legacyMutation.edit(message, payload);
      else if (plan.operation === 'SendNewMessage') message = await legacyMutation.send(payload);
      else throw new Error(`Unsupported Guide publication operation: ${plan.operation}`);
      return { message, lookupResult, plan };
    }
  };
}

module.exports = { createFakeCommunityGuideRuntimeLookupRedirect };
