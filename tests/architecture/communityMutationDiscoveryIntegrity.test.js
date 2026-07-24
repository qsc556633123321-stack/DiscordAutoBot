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
const operationMatrix = fs.readFileSync(path.join(auditDir, 'COMMUNITY_MUTATION_OPERATION_MATRIX.md'), 'utf8');
const requiredBoundarySections = [
  'Scope',
  'Active Runtime Entries',
  'Runtime Call Paths',
  'Read Operations',
  'Mutation Operations',
  'Data Sources',
  'Persisted Records',
  'Discord Objects Used',
  'Authorization',
  'Error Handling',
  'Retry Behavior',
  'Idempotency',
  'Partial Failure Windows',
  'Shared Legacy Helpers',
  'Cross-feature Dependencies',
  'Existing Tests',
  'Missing Baseline Tests',
  'Candidate Slice Boundaries',
  'Explicitly Excluded Responsibilities',
  'Blockers',
  'Recommended Status'
];
assert.match(inventory, /setup-community-guide/);
assert.match(inventory, /refresh-community-guide/);
assert.match(inventory, /Guide Status remains absent: no active mutation consumer/i);
assert.doesNotMatch(inventory, /Cleanup\/rebuild\/admin commands|Proposal modal\/buttons|Concierge buttons|ready\/startup hooks/i);
for (const requiredEntry of [
  'setup-channel-panels', 'bootstrap-community', 'rebuild-community-v3', 'setup-roles',
  'repair-channel-permissions', 'game_suggest_create_modal', 'game_suggest_approve_',
  'concierge_games', 'Events.GuildMemberAdd', 'Events.ChannelDelete', 'Events.ClientReady'
]) {
  assert.match(inventory, new RegExp(requiredEntry.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
}
for (const operation of [
  'G01 locate guide category', 'G15 persist roadmap message ID', 'P07 delete tracked panel message',
  'R04 add role to member', 'O06 schedule reminder', 'Q09 create dynamic game category',
  'B02 create category', 'M06 delete channel'
]) {
  assert.match(operationMatrix, new RegExp(operation.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
}
for (const boundaryFile of requiredDocs.filter((file) => file.endsWith('_MUTATION_BOUNDARY_DISCOVERY.md'))) {
  const boundary = fs.readFileSync(path.join(auditDir, boundaryFile), 'utf8');
  for (const section of requiredBoundarySections) {
    assert.match(boundary, new RegExp(`## ${section.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`), `${boundaryFile} must document ${section}`);
  }
}
assert.match(candidates, /Guide Status.*excluded/i);
assert.match(guideBoundary, /setupCommunityGuide/);
assert.equal(fs.existsSync(path.join(root, 'src', 'application', 'community', 'getCommunityGuideStatus.js')), false);

console.log('Community mutation discovery integrity tests passed.');
