const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..', '..');
const runtime = fs.readFileSync(path.join(root, 'src/systems/communityConcierge.js'), 'utf8');

assert.equal(runtime.includes('GuidePublicationMessageLookupDiscordAdapter'), false);
assert.match(runtime, /channel\.messages\.fetch\(guideMessageId\)\.catch\(\(\) => null\)/);
for (const file of ['src/composition/communityGuideReadFeature.js', 'src/composition/communityPublicationStateFeature.js']) {
  if (fs.existsSync(path.join(root, file))) {
    assert.equal(fs.readFileSync(path.join(root, file), 'utf8').includes('GuidePublicationMessageLookupDiscordAdapter'), false, file);
  }
}
assert.equal(fs.existsSync(path.join(root, 'src/infrastructure/community/guidePublication/GuidePublicationMessageMutationDiscordAdapter.js')), true);
console.log('Guide production lookup adapter remains not wired');
