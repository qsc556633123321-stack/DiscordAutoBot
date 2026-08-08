const { createGuidePublicationResourceSession } = require('../../../src/infrastructure/community/guidePublication/GuidePublicationResourceSession');
const { createGuidePublicationMessageLookupDiscordAdapter } = require('../../../src/infrastructure/community/guidePublication/GuidePublicationMessageLookupDiscordAdapter');
const { createGuidePublicationMessageMutationDiscordAdapter } = require('../../../src/infrastructure/community/guidePublication/GuidePublicationMessageMutationDiscordAdapter');

function createFakeGuidePublicationAdapterPair({ ensuredChannel } = {}) {
  const session = createGuidePublicationResourceSession({ ensuredChannel });
  return {
    lookupPort: createGuidePublicationMessageLookupDiscordAdapter({ session }),
    mutationPort: createGuidePublicationMessageMutationDiscordAdapter({ session })
  };
}

module.exports = { createFakeGuidePublicationAdapterPair };
