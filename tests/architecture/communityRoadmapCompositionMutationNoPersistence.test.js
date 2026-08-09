const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const source = fs.readFileSync(path.resolve(__dirname, '../../src/composition/communityRoadmapAdapterPairFeature.js'), 'utf8');
assert.doesNotMatch(source, /saveOnboarding|repository|node:fs|persistence|writeFile/);
assert.doesNotMatch(source, /RoadmapPublicationMessageMutationAdapter|RoadmapPublicationMessageLookupAdapter|RoadmapPublicationResourceSession/);
console.log('Roadmap Composition has no persistence or direct adapter coupling');
