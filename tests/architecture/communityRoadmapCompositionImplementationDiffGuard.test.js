const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
assert.equal(fs.existsSync(path.join(root, 'src/composition/communityRoadmapAdapterPairFeature.js')), true);
for (const file of [
  'src/application/community/roadmapPublication/RoadmapPublicationCompositionPort.js',
  'src/infrastructure/community/roadmapPublication/RoadmapPublicationMutationAdapter.js'
]) {
  assert.equal(fs.existsSync(path.join(root, file)), false, `${file} must remain absent`);
}
const runtime = fs.readFileSync(path.join(root, 'src/systems/communityConcierge.js'), 'utf8');
assert.doesNotMatch(runtime, /createCommunityRoadmapAdapterPairFeature|createRoadmapPublicationAdapterPair/);
console.log('Roadmap production composition implementation boundary passed');
