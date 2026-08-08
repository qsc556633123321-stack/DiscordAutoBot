const { createGuidePublicationResourceSession } = require('./GuidePublicationResourceSession');
const { createGuidePublicationMessageLookupDiscordAdapter } = require('./GuidePublicationMessageLookupDiscordAdapter');
const { createGuidePublicationMessageMutationDiscordAdapter } = require('./GuidePublicationMessageMutationDiscordAdapter');

function createGuidePublicationAdapterPair({ ensuredChannel } = {}) {
  const session = createGuidePublicationResourceSession({ ensuredChannel });
  return {
    lookupPort: createGuidePublicationMessageLookupDiscordAdapter({ session }),
    mutationPort: createGuidePublicationMessageMutationDiscordAdapter({ session })
  };
}

module.exports = { createGuidePublicationAdapterPair };
