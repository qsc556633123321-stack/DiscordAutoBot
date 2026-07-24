const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..', '..');
const auditDir = path.join(root, 'docs', 'refactor-audit');
const requiredDocs = [
  'COMMUNITY_MUTATION_RUNTIME_ENTRY_INVENTORY.md',
  'COMMUNITY_MUTATION_OPERATION_MATRIX.md',
  'COMMUNITY_MUTATION_SIDE_EFFECT_AUDIT.md',
  'COMMUNITY_GUIDE_MUTATION_BOUNDARY_DISCOVERY.md',
  'COMMUNITY_PANELS_MUTATION_BOUNDARY_DISCOVERY.md',
  'COMMUNITY_BOOTSTRAP_MUTATION_BOUNDARY_DISCOVERY.md',
  'COMMUNITY_ROLES_MUTATION_BOUNDARY_DISCOVERY.md',
  'COMMUNITY_ONBOARDING_MUTATION_BOUNDARY_DISCOVERY.md',
  'COMMUNITY_PROPOSALS_MUTATION_BOUNDARY_DISCOVERY.md',
  'COMMUNITY_MAINTENANCE_MUTATION_BOUNDARY_DISCOVERY.md',
  'COMMUNITY_MUTATION_CROSS_FEATURE_DEPENDENCY_MAP.md',
  'COMMUNITY_MUTATION_OWNERSHIP_MAP.md',
  'COMMUNITY_MUTATION_MIGRATION_RISK_MATRIX.md',
  'COMMUNITY_MUTATION_SLICE_CANDIDATES.md',
  'COMMUNITY_MUTATION_MIGRATION_ROADMAP.md',
  'COMMUNITY_MUTATION_TEST_COVERAGE_AUDIT.md'
];

for (const file of requiredDocs) {
  assert.equal(fs.existsSync(path.join(auditDir, file)), true, `${file} must exist`);
}

const inventory = fs.readFileSync(path.join(auditDir, 'COMMUNITY_MUTATION_RUNTIME_ENTRY_INVENTORY.md'), 'utf8');
const candidates = fs.readFileSync(path.join(auditDir, 'COMMUNITY_MUTATION_SLICE_CANDIDATES.md'), 'utf8');
const guideBoundary = fs.readFileSync(path.join(auditDir, 'COMMUNITY_GUIDE_MUTATION_BOUNDARY_DISCOVERY.md'), 'utf8');
assert.match(inventory, /setup-community-guide/);
assert.match(inventory, /refresh-community-guide/);
assert.match(inventory, /Guide Status\. It is not a mutation candidate/i);
assert.match(candidates, /Guide Status.*excluded/i);
assert.match(guideBoundary, /setupCommunityGuide/);
assert.equal(fs.existsSync(path.join(root, 'src', 'application', 'community', 'getCommunityGuideStatus.js')), false);

console.log('Community mutation discovery integrity tests passed.');
