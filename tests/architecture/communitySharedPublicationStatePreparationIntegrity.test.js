const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..', '..');
for (const file of [
  'src/domain/community/communityPublicationState.js',
  'src/application/community/communityPublicationStateMapper.js',
  'src/application/community/applyPublicationPatch.js',
  'src/application/community/publicationStatePortDecision.js',
  'tests/fixtures/communitySharedPublicationStateFrozenFixture.js'
]) assert.equal(fs.existsSync(path.join(root, file)), true, `${file} must exist`);
const domain = fs.readFileSync(path.join(root, 'src/domain/community/communityPublicationState.js'), 'utf8');
const mapper = fs.readFileSync(path.join(root, 'src/application/community/communityPublicationStateMapper.js'), 'utf8');
const patch = fs.readFileSync(path.join(root, 'src/application/community/applyPublicationPatch.js'), 'utf8');
for (const source of [domain, mapper, patch]) {
  assert.equal(/require\(['"](?:fs|discord\.js)/.test(source), false);
  assert.equal(/writeFile|readFile|guild\.channels|message\./.test(source), false);
}
assert.match(fs.readFileSync(path.join(root, 'src/application/community/publicationStatePortDecision.js'), 'utf8'), /No Production Port Contract Approved/);
assert.equal(fs.existsSync(path.join(root, 'src', 'infrastructure', 'community', 'publicationStateRepository.js')), false);
console.log('Community shared publication state preparation integrity tests passed.');
