const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
const source = fs.readFileSync(path.join(root, 'src/systems/communityConcierge.js'), 'utf8');
const roadmap = source.match(/async function setupRoadmapPanel\(guild\) \{([\s\S]*?)\n\}\n\nasync function maybeAddRole/)[1];
assert.match(source, /require\('\.\.\/application\/community\/roadmapPublication\/RoadmapPublicationMessageLookupPort'\)/);
assert.match(roadmap, /RoadmapPublicationMessageLookupKind\.Available/);
assert.match(roadmap, /RoadmapPublicationMessageLookupKind\.Unavailable/);
assert.doesNotMatch(source, /RoadmapPublicationAdapterPairFactory|RoadmapPublicationResourceSession|RoadmapPublicationMessageLookupAdapter/);
console.log('Roadmap runtime lookup redirect implementation import boundary passed');
