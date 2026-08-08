const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..', '..');
for (const forbidden of [
  'src/infrastructure/community/GuidePublicationResourceSession.js',
  'src/infrastructure/community/GuidePublicationMessageLookupDiscordAdapter.js',
  'src/composition/communityGuideChannelResourceFeature.js'
]) assert.equal(fs.existsSync(path.join(root, forbidden)), false, forbidden);
console.log('Guide channel resource boundary diff guard passed');
