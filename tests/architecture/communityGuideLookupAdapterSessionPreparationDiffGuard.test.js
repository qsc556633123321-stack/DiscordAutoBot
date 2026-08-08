const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..', '..');

for (const forbidden of [
  'src/infrastructure/community/GuidePublicationMessageMutationDiscordAdapter.js',
  'src/composition/communityGuideLookupAdapterSessionFeature.js'
]) assert.equal(fs.existsSync(path.join(root, forbidden)), false, forbidden);
console.log('Guide lookup adapter session preparation diff guard passed');
