const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..', '..');
const runtime = fs.readFileSync(path.join(root, 'src/systems/communityConcierge.js'), 'utf8');

assert.equal(runtime.includes('GuidePublicationResourceSession'), false);
for (const file of ['src/composition/communityGuideReadFeature.js', 'src/composition/communityPublicationStateFeature.js']) {
  if (fs.existsSync(path.join(root, file))) {
    assert.equal(fs.readFileSync(path.join(root, file), 'utf8').includes('GuidePublicationResourceSession'), false, file);
  }
}
console.log('Guide production resource session remains not wired');
