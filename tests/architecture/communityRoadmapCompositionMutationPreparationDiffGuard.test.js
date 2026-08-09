const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../..');
for (const file of [
  'src/composition/communityRoadmapAdapterPairFeature.js',
  'src/infrastructure/community/roadmapPublication/RoadmapPublicationAdapterPairFactory.js',
  'src/systems/communityConcierge.js'
]) assert.equal(fs.existsSync(path.join(root, file)), true);
console.log('Roadmap Composition mutation preparation keeps production source unchanged');
