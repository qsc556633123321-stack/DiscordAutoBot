const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', '..');
for (const relativePath of [
  'src/application/community/ports/communityPublicationStateStore.js',
  'src/application/community/communityPublicationPersistenceErrors.js',
  'src/application/community/communityPublicationStateOperations.js',
  'tests/helpers/inMemoryCommunityPublicationStateStore.js',
  'docs/refactor-audit/COMMUNITY_PUBLICATION_PERSISTENCE_BOUNDARY_INPUT_AUDIT.md',
  'docs/refactor-audit/COMMUNITY_PUBLICATION_PERSISTENCE_PORT_CANDIDATES.md',
  'docs/refactor-audit/COMMUNITY_SHARED_PUBLICATION_STATE_READINESS.md',
]) {
  assert.equal(fs.existsSync(path.join(root, relativePath)), true, `missing ${relativePath}`);
}

const decision = fs.readFileSync(path.join(root, 'src/application/community/publicationStatePortDecision.js'), 'utf8');
assert.match(decision, /No Production Persistence Port Approved/);
console.log('community publication persistence boundary preparation integrity passed');
