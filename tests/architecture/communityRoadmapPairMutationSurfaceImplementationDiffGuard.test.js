const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
const pair = fs.readFileSync(path.join(root, 'src/infrastructure/community/roadmapPublication/RoadmapPublicationAdapterPairFactory.js'), 'utf8');
assert.match(pair, /RoadmapPublicationMessageMutationAdapter/);
assert.match(pair, /mutationPort/);
for (const file of [
  'src/composition/communityRoadmapAdapterPairFeature.js',
  'src/systems/communityConcierge.js',
  'src/application/community/roadmapPublication/RoadmapPublicationMessageMutationPort.js',
  'src/infrastructure/community/roadmapPublication/RoadmapPublicationResourceSession.js'
]) assert.equal(fs.existsSync(path.join(root, file)), true);
console.log('Roadmap Pair mutation surface implementation diff guard passed');
