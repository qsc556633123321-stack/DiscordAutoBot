const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
const pair = fs.readFileSync(path.join(root, 'src/infrastructure/community/roadmapPublication/RoadmapPublicationAdapterPairFactory.js'), 'utf8');
const composition = fs.readFileSync(path.join(root, 'src/composition/communityRoadmapAdapterPairFeature.js'), 'utf8');
const runtime = fs.readFileSync(path.join(root, 'src/systems/communityConcierge.js'), 'utf8');
assert.doesNotMatch(pair, /mutationPort|getRetainedMutationFailure|RoadmapPublicationMessageMutationAdapter/);
assert.doesNotMatch(composition, /mutationPort|RoadmapPublicationMessageMutationAdapter/);
assert.doesNotMatch(runtime, /RoadmapPublicationMessageMutationAdapter|roadmapMutationPort/);
assert.match(runtime, /await message\.edit\(payload\)/);
assert.match(runtime, /message = await channel\.send\(payload\)/);
console.log('Roadmap production Pair remains lookup-only during mutation surface preparation');
