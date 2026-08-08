const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..', '..');

for (const file of [
  'src/application/community/ports/GuidePublicationMessageLookupPort.js',
  'src/application/community/guideLookup/GuidePublicationMessageLookupRequest.js',
  'src/application/community/guideLookup/GuidePublicationMessageLookupResult.js'
]) assert.equal(fs.existsSync(path.join(root, file)), true, file);
for (const forbidden of [
  'src/infrastructure/community/GuidePublicationMessageLookupDiscordAdapter.js',
  'src/composition/communityGuidePublicationMessageLookupFeature.js'
]) assert.equal(fs.existsSync(path.join(root, forbidden)), false, forbidden);
console.log('Guide message lookup adapter preparation diff guard passed');
