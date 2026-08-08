const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..', '..');

for (const forbidden of [
  'src/composition/communityGuideAdapterPairFeature.js',
  'src/application/community/guidePublication/GuidePublicationAdapterPair.js'
]) assert.equal(fs.existsSync(path.join(root, forbidden)), false, forbidden);
console.log('Guide adapter pair composition preparation diff guard passed');
