const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..');
const runtime = fs.readFileSync(path.join(root, 'src/systems/communityConcierge.js'), 'utf8');
assert.equal(/buildGuidePublicationMutationPlan/.test(runtime), false);
for (const file of [
  'src/infrastructure/community/discordGuidePublicationAdapter.js',
  'src/application/community/guidePublication/GuidePublicationPort.js',
  'src/composition/communityGuidePublicationFeature.js'
]) assert.equal(fs.existsSync(path.join(root, file)), false, file);
for (const file of [
  'src/application/community/guidePublication/GuidePublicationMutationInput.js',
  'src/application/community/guidePublication/GuidePublicationMutationPlan.js',
  'src/application/community/guidePublication/buildGuidePublicationMutationPlan.js'
]) {
  const source = fs.readFileSync(path.join(root, file), 'utf8');
  assert.equal(/discord\.js|node:fs|\.send\(|\.edit\(|saveOnboarding/.test(source), false, file);
}
console.log('community Guide mutation runtime integration preparation boundary passed');
