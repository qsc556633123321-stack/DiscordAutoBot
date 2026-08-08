const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../../../..');

for (const file of [
  'src/application/community/ports/GuidePublicationMessageMutationPort.js',
  'src/application/community/guideDiscordMutation/GuidePublicationMessageEditRequest.js',
  'src/application/community/guideDiscordMutation/GuidePublicationMessageSendRequest.js',
  'src/application/community/guideDiscordMutation/GuidePublicationMessageMutationResult.js',
  'src/application/community/guideDiscordMutation/GuidePublicationMessageMutationFailure.js'
]) {
  const source = fs.readFileSync(path.join(root, file), 'utf8');
  assert.equal(/saveOnboarding|PersistCommunityPublicationRecord|repository|Filesystem|JSON|Roadmap/.test(source), false, file);
}
console.log('Guide publication message mutation Application port persistence separation passed');
