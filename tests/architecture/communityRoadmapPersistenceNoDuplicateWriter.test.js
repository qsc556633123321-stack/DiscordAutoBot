const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../../src');
for (const name of ['roadmapPublicationStateFilesystemAdapter.js', 'roadmapPublicationStateRepository.js']) {
  assert.equal(fs.existsSync(path.join(root, 'infrastructure/community', name)), false);
}
const candidate = fs.readFileSync(path.resolve(__dirname, '../fakes/community/FakeRoadmapPublicationPersistenceRequest.js'), 'utf8');
assert.doesNotMatch(candidate, /node:fs|writeFile|readFile|discord\.js/);
console.log('Roadmap request preparation introduces no duplicate writer or repository');
