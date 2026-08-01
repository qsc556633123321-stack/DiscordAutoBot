const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..');
for (const file of [
  'src/application/community/guidePublication/GuidePublicationOperationType.js',
  'src/application/community/guidePublication/GuidePublicationMutationInput.js',
  'src/application/community/guidePublication/GuidePublicationMutationPlan.js',
  'src/application/community/guidePublication/buildGuidePublicationMutationPlan.js'
]) {
  const source = fs.readFileSync(path.join(root, file), 'utf8');
  assert.equal(/discord\.js|node:fs|node:path|systems\/|infrastructure\/|composition\/|\.send\(|\.edit\(|saveOnboarding|JSON\./.test(source), false, file);
}
const runtime = fs.readFileSync(path.join(root, 'src/systems/communityConcierge.js'), 'utf8');
assert.equal(/guidePublication/.test(runtime), false);
console.log('guide publication mutation plan boundary passed');
