const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../../../..');

const fake = fs.readFileSync(path.join(root, 'tests/fakes/community/FakeGuideDiscordResources.js'), 'utf8');
assert.equal(/saveOnboarding|PersistCommunityPublicationRecord|repository|Filesystem|Roadmap|JSON|interaction|guild\.channels\.create/.test(fake), false);
for (const file of [
  'src/application/community/ports/GuidePublicationMessageMutationPort.js',
  'src/application/community/guideDiscordMutation/GuidePublicationMessageEditRequest.js',
  'src/application/community/guideDiscordMutation/GuidePublicationMessageSendRequest.js'
]) {
  const source = fs.readFileSync(path.join(root, file), 'utf8');
  assert.equal(/discord\.js|node:fs|systems\/|infrastructure\/|composition\//.test(source), false, file);
}
console.log('Guide publication message mutation adapter separation passed');
