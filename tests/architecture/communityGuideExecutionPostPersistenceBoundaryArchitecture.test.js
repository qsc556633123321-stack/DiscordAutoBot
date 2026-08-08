const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..');
const source = (file) => fs.readFileSync(path.join(root, file), 'utf8');
for (const file of [
  'src/application/community/guideExecution/GuidePublicationExecutionRequest.js',
  'src/application/community/guideExecution/GuidePublicationExecutionResult.js',
  'src/application/community/guideExecution/GuidePublicationExecutionFailure.js'
]) {
  assert.equal(/discord\.js|node:fs|systems\/|infrastructure\/|composition\/|\.send\(|\.edit\(|saveOnboarding/.test(source(file)), false, file);
}
for (const forbidden of [
  'src/application/community/guideExecution/GuidePublicationMessageMutationPort.js',
  'src/infrastructure/community/discordGuidePublicationAdapter.js',
  'src/composition/communityGuideExecutionFeature.js'
]) assert.equal(fs.existsSync(path.join(root, forbidden)), false, forbidden);

console.log('Community Guide execution post-persistence architecture boundary passed.');
