const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(path.resolve(__dirname, '../fakes/community/FakeProductionShapeRoadmapMutationAdapter.js'), 'utf8');
assert.match(source, /createRoadmapPublicationMessageEditSuccess/);
assert.match(source, /createRoadmapPublicationMessageSendSuccess/);
assert.doesNotMatch(source, /saveOnboarding|repository|node:fs|require\(['"]fs['"]\)|GuidePublication/);
console.log('Roadmap mutation adapter candidate maps only application-safe results');
