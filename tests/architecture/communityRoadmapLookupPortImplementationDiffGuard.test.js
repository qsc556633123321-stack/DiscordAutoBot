const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
assert.equal(fs.existsSync(path.join(root, 'src/application/community/roadmapPublication/RoadmapPublicationMessageLookupPort.js')), true);
for (const file of [
  'src/infrastructure/community/roadmapPublication/RoadmapPublicationMessageLookupAdapter.js',
  'src/composition/communityRoadmapLookupFeature.js'
]) {
  assert.equal(fs.existsSync(path.join(root, file)), false, `${file} must remain absent`);
}
const runtime = fs.readFileSync(path.join(root, 'src/systems/communityConcierge.js'), 'utf8');
assert.doesNotMatch(runtime, /RoadmapPublicationMessageLookupPort/);
console.log('Roadmap lookup port implementation boundary passed');
