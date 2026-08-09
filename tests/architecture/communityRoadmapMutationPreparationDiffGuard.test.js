const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
const source = fs.readFileSync(path.join(root, 'src/systems/communityConcierge.js'), 'utf8');
assert.match(source, /lookupPort\.lookupTrackedMessage\(\{ messageId: roadmapMessageId \}\)/);
assert.doesNotMatch(source, /channel\.messages\.fetch\(roadmapMessageId\)/);
assert.equal(fs.existsSync(path.join(root, 'tests/fakes/community/FakeCommunityRoadmapMutationBoundary.js')), true);
console.log('Roadmap mutation preparation preserves runtime lookup migration and production boundary');
