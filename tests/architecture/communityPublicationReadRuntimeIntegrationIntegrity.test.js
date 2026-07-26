const assert = require('assert');
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..', '..');
for (const file of [
  'docs/refactor-audit/COMMUNITY_PUBLICATION_READ_RUNTIME_INTEGRATION_INPUT_AUDIT.md',
  'docs/refactor-audit/COMMUNITY_PUBLICATION_READ_RUNTIME_CONSUMER_INVENTORY.md',
  'docs/refactor-audit/COMMUNITY_PUBLICATION_READ_INTEGRATION_TARGET_DECISION.md',
  'docs/refactor-audit/COMMUNITY_PUBLICATION_READ_RUNTIME_BRANCH_MATRIX.md',
  'docs/refactor-audit/COMMUNITY_PUBLICATION_READ_RUNTIME_OBSERVABLE_COMPATIBILITY.md',
  'docs/refactor-audit/COMMUNITY_PUBLICATION_READ_RUNTIME_ROLLBACK_PLAN.md',
  'docs/refactor-audit/COMMUNITY_PUBLICATION_READ_RUNTIME_INTEGRATION_COVERAGE.md',
  'tests/community/communityPublicationReadRuntimeIntegration.test.js',
  'tests/community/communityPublicationReadRuntimeDifferentialCompatibility.test.js',
  'tests/architecture/communityPublicationReadRuntimeBoundaryArchitecture.test.js',
  'tests/architecture/communityPublicationReadRuntimeDiffGuard.test.js',
]) assert.equal(fs.existsSync(path.join(root, file)), true, `missing ${file}`);
const runtime = fs.readFileSync(path.join(root, 'src/systems/communityConcierge.js'), 'utf8');
assert.match(runtime, /fromLegacyPublicationRecord/);
assert.equal(/toLegacyPublicationPatch|applyPublicationPatch|CommunityPublicationStateStore/.test(runtime), false);
assert.equal(fs.existsSync(path.join(root, 'src/infrastructure/community/communityPublicationStateFilesystemAdapter.js')), false);
console.log('community publication read runtime integration integrity passed');
