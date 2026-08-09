const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(
  path.resolve(__dirname, '../fakes/community/FakeCommunityRoadmapRuntimePersistenceRedirect.js'),
  'utf8'
);
const fixture = JSON.parse(fs.readFileSync(
  path.resolve(__dirname, '../fixtures/community/community-roadmap-runtime-persistence-redirect-cases.json'),
  'utf8'
));

assert.match(source, /createRoadmapPublicationPersistenceRequest/);
assert.match(source, /createCommunityRoadmapPersistenceFeature/);
assert.match(source, /communityRoadmapPersistenceFeature\.persist\(request\)/);
assert.doesNotMatch(source, /roadmapChannelId|roadmapMessageId|\bpatch\b|saveOnboarding|node:fs|discord\.js|await|Promise\./);
assert.equal(fixture.cases.length, 50);
assert.equal(new Set(fixture.cases).size, 50);

console.log('Roadmap runtime persistence redirect candidate uses semantic request and reuse feature only.');
