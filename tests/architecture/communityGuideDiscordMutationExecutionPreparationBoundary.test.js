const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..', '..');
for (const file of [
  'src/application/community/guideExecution/GuidePublicationExecutionFailure.js',
  'src/application/community/guideExecution/GuidePublicationExecutionRequest.js',
  'src/application/community/guideExecution/GuidePublicationExecutionResult.js'
]) {
  const source = fs.readFileSync(path.join(root, file), 'utf8');
  assert.equal(/discord\.js|node:fs|systems\/|infrastructure\/|composition\/|\.send\(|\.edit\(|saveOnboarding/.test(source), false, file);
}
for (const file of ['src/infrastructure/community/discordGuidePublicationAdapter.js', 'src/application/community/guideExecution/GuidePublicationExecutionPort.js', 'src/composition/communityGuideExecutionFeature.js']) assert.equal(fs.existsSync(path.join(root, file)), false, file);
console.log('community Guide Discord mutation execution preparation boundary passed');
