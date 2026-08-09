const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
const fakePath = path.join(root, 'tests/fakes/community/FakeProductionShapeGuidePersistenceFeature.js');
const runtimePath = path.join(root, 'src/systems/communityConcierge.js');
const source = fs.readFileSync(fakePath, 'utf8');
const runtime = fs.readFileSync(runtimePath, 'utf8');
const guide = runtime.match(/async function setupCommunityGuide\(guild, options = \{\}\) \{([\s\S]*?)\n\}\n\nasync function setupRoadmapPanel/)[1];

assert.equal(fs.existsSync(path.join(root, 'src/composition/communityGuidePersistenceFeature.js')), false);
assert.match(source, /mapGuidePersistenceRequestToGenericInput/);
assert.match(source, /persistCommunityPublicationRecord\.execute/);
assert.doesNotMatch(source, /node:fs|readFile|writeFile|onboarding-flows\.json|discord\.js|\bGuild\b|\bChannel\b|\bMessage\b|communityPublicationRecordRepository|GuidePersistencePort|RoadmapPublicationPersistenceRequest|communityRoadmapPersistenceFeature|saveOnboarding/);
assert.match(guide, /saveOnboarding\(guild\.id, \{/);
assert.doesNotMatch(guide, /createCommunityGuidePersistenceFeature|createGuidePersistenceRequest|mapGuidePersistenceRequestToGenericInput/);
console.log('Guide persistence reuse remains a test-only Composition candidate while Guide runtime stays legacy-owned');
