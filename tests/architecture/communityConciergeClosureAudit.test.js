const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..');
const runtimePath = path.join(root, 'src', 'systems', 'communityConcierge.js');
const runtime = fs.readFileSync(runtimePath, 'utf8');
const fixtures = JSON.parse(fs.readFileSync(path.join(root, 'tests', 'fixtures', 'community', 'community-concierge-closure-audit-cases.json'), 'utf8'));
const auditDocs = [
  'COMMUNITY_CONCIERGE_RESPONSIBILITY_MAP.md',
  'COMMUNITY_CONCIERGE_FUNCTION_INVENTORY.md',
  'COMMUNITY_CONCIERGE_DEPENDENCY_INVENTORY.md',
  'COMMUNITY_CONCIERGE_FILESYSTEM_OWNERSHIP_AUDIT.md',
  'COMMUNITY_CONCIERGE_DIRECT_DISCORD_OPERATIONS_AUDIT.md',
  'COMMUNITY_CONCIERGE_PERSISTENCE_CLOSURE_AUDIT.md',
  'COMMUNITY_CONCIERGE_LEGACY_STATE_AUDIT.md',
  'COMMUNITY_CONCIERGE_AI_OWNERSHIP_AUDIT.md',
  'COMMUNITY_WELCOME_CLOSURE_AUDIT.md',
  'COMMUNITY_ROADMAP_FINAL_CLOSURE_AUDIT.md',
  'COMMUNITY_ROLE_FLOW_AUDIT.md',
  'COMMUNITY_INTERACTION_FLOW_AUDIT.md',
  'COMMUNITY_CONCIERGE_EVENT_WIRING_AUDIT.md',
  'COMMUNITY_CONCIERGE_REMAINING_RISK_RANKING.md',
  'COMMUNITY_CONCIERGE_POST_CLOSURE_AUDIT_READINESS.md'
];

assert.ok(fixtures.length >= 50);
for (const file of auditDocs) {
  assert.equal(fs.existsSync(path.join(root, 'docs', 'refactor-audit', file)), true, `${file} must exist`);
}
for (const helper of ['readOnboardingData', 'saveOnboarding']) {
  assert.equal(runtime.includes(helper), false, `${helper} must remain removed`);
}
for (const required of ['ONBOARDING_FILE', 'function ensureFile(', 'function readJson(']) {
  assert.equal(runtime.includes(required), true, `${required} must remain runtime-owned`);
}
assert.equal((runtime.match(/createCommunityOnboardingStateReader\(/g) || []).length, 3);
assert.equal((runtime.match(/createCommunityPublicationTrackingReadCompatibilityAdapter/g) || []).length, 3);
assert.equal((runtime.match(/createCommunityPublicationChannelTrackingReadCompatibilityAdapter/g) || []).length, 2);
assert.equal(runtime.includes('fromLegacyPublicationRecord'), false);
assert.equal(runtime.includes('data.guideMessageId'), false);
assert.equal(runtime.includes('data.roadmapMessageId'), false);
assert.equal(runtime.includes('data.guideChannelId'), false);
assert.equal(runtime.includes('persistCommunityPublicationRecord'), false);

const changedSource = execFileSync('git', ['diff', '--name-only', '--', 'src'], { cwd: root, encoding: 'utf8' })
  .trim().split(/\r?\n/).filter(Boolean);
assert.equal(
  changedSource.length === 0 || (changedSource.length === 1 && changedSource[0] === 'src/systems/communityConcierge.js'),
  true,
  'Closure audit permits only the approved Welcome runtime redirect.'
);
console.log('Community Concierge closure audit preserves active ownership outside the approved Welcome redirect.');
