const assert = require('node:assert/strict');
const { buildFullGuildDesiredState } = require('../../src/domain/community/serverGovernanceDesiredState');
const { buildGovernancePermissionMatrix, buildProjectedGuildStats, validateProjectedGuildQuality } = require('../../src/domain/community/serverGovernanceReleaseCandidate');
const { buildFullGuildGovernancePreview } = require('../../src/application/community/createServerGovernancePlanUseCase');
const { compileApprovedGovernancePlan } = require('../../src/application/community/serverGovernanceApprovedPlanUseCase');
const { createResourceFingerprint } = require('../../src/domain/community/serverGovernanceReviewDecisionPolicy');
const { createProductionReviewSnapshot } = require('../fixtures/community/server-governance-production-review-snapshot');
const { getCommandRegistry } = require('../../src/modules/commands/commandRegistry');
const { ROUTES } = require('../../src/modules/commands/commandRouter');

function reviewedDecisions(inventory, guildId = 'major-release-fixture') {
  return inventory.filter((resource) => resource.id.startsWith('custom-') || resource.migrationReviewReason).map((resource) => ({
    guildId,
    resourceId: resource.id,
    resourceFingerprint: createResourceFingerprint(resource),
    decision: resource.id.startsWith('custom-') ? 'IGNORE_GOVERNANCE' : resource.migrationReviewReason.includes('voice_only') ? 'DELETE' : 'KEEP',
    canonicalTargetKey: null,
    schemaVersion: 1
  }));
}

function reconciledInventory(desiredState, initialInventory) {
  const canonical = desiredState.resources.map((resource, index) => Object.freeze({
    id: `reconciled-${index}`,
    name: resource.displayName,
    type: resource.type,
    parentCanonicalKey: resource.parentKey || null,
    canonicalKey: resource.key,
    purpose: resource.purpose,
    owner: resource.owner,
    lifecycle: resource.lifecycle,
    accessProfile: resource.accessProfile,
    accessRoleKey: resource.accessRoleKey,
    permissionSummary: []
  }));
  const custom = initialInventory.filter((resource) => resource.id.startsWith('custom-'));
  return Object.freeze([...canonical, ...custom]);
}

const desiredState = buildFullGuildDesiredState();
const snapshot = createProductionReviewSnapshot(desiredState);
const decisions = reviewedDecisions(snapshot.inventory);
const approvedPlan = compileApprovedGovernancePlan({
  guildId: 'major-release-fixture',
  compiledBy: 'release-test',
  inventory: snapshot.inventory,
  desiredState,
  decisions,
  compiledAt: '2026-09-24T00:00:00.000Z'
});

assert.equal(desiredState.resources.filter((resource) => resource.type === 'category').length, 16);
assert.equal(desiredState.resources.filter((resource) => resource.type !== 'category').length, 43);
assert.deepEqual(buildProjectedGuildStats(desiredState, require('../../src/domain/games/gameRegistry')).layouts, { full: 4, compact: 3, voice_only: 3 });
assert.equal(validateProjectedGuildQuality({ desiredState, gameRegistry: require('../../src/domain/games/gameRegistry') }).ok, true);
assert.deepEqual(approvedPlan.summary, { CREATE_CHANNEL: 6, DELETE_CHANNEL: 6, RENAME_RESOURCE: 3, UPDATE_PERMISSIONS: 9 });
assert.equal(approvedPlan.operations.length, 24);
assert.equal(approvedPlan.operations.filter((operation) => operation.destructive).length, 6);
assert.equal(approvedPlan.operations.some((operation) => operation.type === 'DELETE_CATEGORY'), false);

const matrix = buildGovernancePermissionMatrix(desiredState, require('../../src/domain/games/gameRegistry'));
assert.equal(matrix.guest['category:entry'], true);
assert.equal(matrix.guest['category:game_center'], false);
assert.equal(matrix.member['channel:general'], true);
assert.equal(matrix['game:league_of_legends']['category:game:league_of_legends'], true);
assert.equal(matrix['game:league_of_legends']['category:game:apex'], false);
assert.equal(matrix.admin['category:admin'], true);

const finalInventory = reconciledInventory(desiredState, snapshot.inventory);
const finalDecisions = reviewedDecisions(finalInventory);
const finalPreview = buildFullGuildGovernancePreview({ inventory: finalInventory, desiredState, decisions: finalDecisions });
const governedActions = finalPreview.plan.actions.filter((action) => !['KEEP', 'REVIEW'].includes(action.action));
assert.deepEqual(governedActions, []);
assert.equal(finalPreview.reviewManifest.entries.filter((entry) => ['UNDECIDED', 'STALE', 'CONFLICT', 'ORPHANED_DECISION'].includes(entry.decisionState)).length, 0);
assert.equal(finalPreview.reviewManifest.entries.every((entry) => entry.decisionState === 'IGNORE_GOVERNANCE'), true);
assert.equal(finalInventory.length, 126);

const registry = getCommandRegistry();
const deployedNames = [...registry.keys()];
assert.equal(deployedNames.length, 72);
assert.equal(new Set(deployedNames).size, deployedNames.length);
assert.equal(deployedNames.includes('server-governance-execute'), false);
assert.equal(ROUTES.admin['server-governance-preview'].target, 'server-governance-preview');
assert.equal(ROUTES.admin['server-governance-review'].target, 'server-governance-review');
assert.equal(ROUTES.admin['server-governance-plan'].target, 'server-governance-plan');

console.log('Major release governance reconciliation tests passed.');
