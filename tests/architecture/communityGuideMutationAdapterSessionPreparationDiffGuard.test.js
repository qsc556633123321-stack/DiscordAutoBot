const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..', '..');

for (const forbidden of [
  'src/infrastructure/community/guidePublication/GuidePublicationMessageMutationDiscordAdapter.js',
  'src/composition/communityGuideMutationAdapterFeature.js',
  'src/application/community/guidePublication/createGuidePublicationMutationAdapterSession.js'
]) assert.equal(fs.existsSync(path.join(root, forbidden)), false, forbidden);
console.log('Guide mutation adapter session preparation diff guard passed');
