const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..', '..');

for (const file of [
  'src/application/community/ports/GuidePublicationMessageMutationPort.js',
  'src/application/community/guideDiscordMutation/GuidePublicationMessageEditRequest.js',
  'src/application/community/guideDiscordMutation/GuidePublicationMessageSendRequest.js'
]) assert.equal(fs.existsSync(path.join(root, file)), true, file);
for (const forbidden of [
  'src/infrastructure/community/GuidePublicationMessageMutationDiscordAdapter.js',
  'src/composition/communityGuideDiscordMutationFeature.js'
]) assert.equal(fs.existsSync(path.join(root, forbidden)), false, forbidden);
console.log('Guide Discord mutation adapter preparation diff guard passed');
