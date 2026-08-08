const { assertGuidePublicationMessageLookupPort } = require('../../../../src/application/community/ports/GuidePublicationMessageLookupPort');
const { createGuidePublicationMessageLookupDiscordAdapter } = require('../../../../src/infrastructure/community/guidePublication/GuidePublicationMessageLookupDiscordAdapter');

assertGuidePublicationMessageLookupPort(createGuidePublicationMessageLookupDiscordAdapter({
  session: { async lookupTrackedMessage() { return { available: false }; } }
}));
console.log('Guide production lookup adapter Port compliance passed');
