const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
for (const file of [
  'src/infrastructure/community/roadmapPublication/RoadmapPublicationAdapterPairFactory.js',
  'src/infrastructure/community/roadmapPublication/RoadmapPublicationMessageMutationAdapter.js',
  'src/infrastructure/community/roadmapPublication/RoadmapPublicationResourceSession.js',
  'src/application/community/roadmapPublication/RoadmapPublicationMessageMutationPort.js',
  'src/composition/communityRoadmapAdapterPairFeature.js',
  'src/systems/communityConcierge.js'
]) assert.equal(fs.existsSync(path.join(root, file)), true, `${file} must remain present`);
console.log('Roadmap Pair mutation surface preparation diff guard passed');
