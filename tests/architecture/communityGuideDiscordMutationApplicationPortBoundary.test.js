const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..', '..');

for (const file of [
  'src/application/community/ports/GuidePublicationMessageMutationPort.js',
  'src/application/community/guideDiscordMutation/GuidePublicationMessageEditRequest.js',
  'src/application/community/guideDiscordMutation/GuidePublicationMessageSendRequest.js',
  'src/application/community/guideDiscordMutation/GuidePublicationMessageMutationResult.js',
  'src/application/community/guideDiscordMutation/GuidePublicationMessageMutationFailure.js'
]) {
  const source = fs.readFileSync(path.join(root, file), 'utf8');
  assert.equal(/discord\.js|node:fs|systems\/|infrastructure\/|composition\/|saveOnboarding|Roadmap|\.send\(|\.edit\(/.test(source), false, file);
}
assert.equal(fs.existsSync(path.join(root, 'src/infrastructure/community/discordGuidePublicationAdapter.js')), false);
assert.equal(fs.existsSync(path.join(root, 'src/composition/communityGuideDiscordMutationFeature.js')), false);
console.log('Guide Discord mutation Application port boundary passed');
