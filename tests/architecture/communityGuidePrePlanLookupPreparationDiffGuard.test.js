const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..', '..');

for (const unchangedBoundary of [
  'src/application/community/ports/GuidePublicationMessageMutationPort.js',
  'src/application/community/guideDiscordMutation/GuidePublicationMessageEditRequest.js',
  'src/application/community/guidePublication/buildGuidePublicationMutationPlan.js',
  'src/composition/communityPublicationStateFeature.js'
]) assert.equal(fs.existsSync(path.join(root, unchangedBoundary)), true, unchangedBoundary);
for (const forbidden of [
  'src/infrastructure/community/GuidePublicationMessageLookupDiscordAdapter.js',
  'src/infrastructure/community/discordGuidePublicationMessageLookupAdapter.js',
  'src/composition/communityGuidePublicationMessageLookupFeature.js'
]) assert.equal(fs.existsSync(path.join(root, forbidden)), false, forbidden);
console.log('Guide pre-Plan lookup preparation diff guard passed');
