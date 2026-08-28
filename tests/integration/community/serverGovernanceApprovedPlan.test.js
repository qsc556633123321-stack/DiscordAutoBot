const assert = require('node:assert/strict');
const { ChannelLifecycle, ChannelOwnership, ChannelPurpose } = require('../../../src/domain/community/channelGovernance');
const { buildFullGuildDesiredState } = require('../../../src/domain/community/serverGovernanceDesiredState');
const { createResourceFingerprint } = require('../../../src/domain/community/serverGovernanceReviewDecisionPolicy');
const { compileApprovedGovernancePlan, createServerGovernanceApprovedPlanUseCase } = require('../../../src/application/community/serverGovernanceApprovedPlanUseCase');
const { createProductionReviewSnapshot } = require('../../fixtures/community/server-governance-production-review-snapshot');

function decisionsFor(inventory, guildId = 'guild-plan') {
  return inventory.filter((resource) => resource.id.startsWith('custom-') || resource.migrationReviewReason).map((resource) => ({ guildId, resourceId: resource.id, resourceFingerprint: createResourceFingerprint(resource), decision: resource.id.startsWith('custom-') ? 'IGNORE_GOVERNANCE' : resource.migrationReviewReason.includes('voice_only') ? 'DELETE' : 'KEEP', canonicalTargetKey: null, schemaVersion: 1 }));
}
function memoryPlanStore() {
  const records = new Map(); const audits = new Map();
  return { savePlan({ plan, actorId }) { const old = records.get(plan.guildId); const record = { plan, storageStatus: 'ACTIVE' }; records.set(plan.guildId, record); audits.set(plan.guildId, [...(audits.get(plan.guildId) || []), ...(old ? [{ event: 'PLAN_SUPERSEDED' }] : []), { event: 'PLAN_COMPILED', actorId }]); return record; }, loadLatestPlan({ guildId }) { return records.get(guildId) || null; }, listPlans({ guildId }) { return records.has(guildId) ? [records.get(guildId)] : []; }, listAudit({ guildId }) { return audits.get(guildId) || []; }, recordVerification({ guildId, result }) { audits.set(guildId, [...(audits.get(guildId) || []), { event: result.status === 'VALID' ? 'PLAN_VERIFICATION_PASSED' : 'PLAN_VERIFICATION_FAILED' }]); } };
}

const desiredState = buildFullGuildDesiredState();
const snapshot = createProductionReviewSnapshot(desiredState);
const decisions = decisionsFor(snapshot.inventory);
const input = { guildId: 'guild-plan', compiledBy: 'admin', inventory: snapshot.inventory, desiredState, decisions, compiledAt: '2026-01-01T00:00:00.000Z' };
const first = compileApprovedGovernancePlan(input);
const second = compileApprovedGovernancePlan({ ...input, compiledAt: '2026-02-01T00:00:00.000Z' });
assert.equal(first.status, 'READY_FOR_EXECUTION_REVIEW');
assert.equal(first.planFingerprint, second.planFingerprint);
assert.deepEqual(first.summary, { CREATE_CHANNEL: 6, DELETE_CHANNEL: 6, RENAME_RESOURCE: 3, UPDATE_PERMISSIONS: 9 });
assert.equal(first.operations.length, 24);
assert.equal(first.operations.filter((operation) => operation.destructive).length, 6);
assert.equal(first.operations.filter((operation) => operation.rollbackClass === 'REVERSIBLE').length, 3);
assert.equal(first.operations.filter((operation) => operation.rollbackClass === 'PARTIALLY_REVERSIBLE').length, 15);
assert.equal(first.operations.filter((operation) => operation.rollbackClass === 'IRREVERSIBLE').length, 6);
assert.equal(first.operations.some((operation) => operation.type === 'DELETE_CATEGORY'), false);
assert.equal(first.operations.every((operation) => Object.isFrozen(operation)), true);
assert.equal(Object.isFrozen(first), true);

const store = memoryPlanStore();
const useCase = createServerGovernanceApprovedPlanUseCase({ planStore: store });
assert.equal(useCase.save({ plan: first, actorId: 'admin' }).saved, true);
assert.deepEqual(useCase.verify({ plan: first, freshInventory: snapshot.inventory, currentDesiredState: desiredState, currentDecisions: decisions }), { status: 'VALID', blockers: [] });
assert.equal(store.listAudit({ guildId: 'guild-plan' }).some((event) => event.event === 'PLAN_VERIFICATION_PASSED'), true);
assert.equal(useCase.verify({ plan: first, freshInventory: snapshot.inventory.map((resource, index) => index === 0 ? { ...resource, name: 'renamed' } : resource), currentDesiredState: desiredState, currentDecisions: decisions }).blockers.includes('PLAN_STALE'), true);
const changedDesired = { resources: desiredState.resources.map((resource) => resource.key === 'channel:dev' ? { ...resource, displayName: 'changed' } : resource) };
assert.equal(useCase.verify({ plan: first, freshInventory: snapshot.inventory, currentDesiredState: changedDesired, currentDecisions: decisions }).blockers.includes('PLAN_OBSOLETE'), true);
const changedDecisions = decisions.map((decision) => decision.resourceId === 'legacy-gtfo-extra-0' ? { ...decision, decision: 'KEEP' } : decision);
assert.equal(useCase.verify({ plan: first, freshInventory: snapshot.inventory, currentDesiredState: desiredState, currentDecisions: changedDecisions }).blockers.includes('PLAN_DECISIONS_CHANGED'), true);

const protectedResource = { id: 'runtime', name: 'runtime', type: 'voice', purpose: ChannelPurpose.RUNTIME_VOICE, owner: ChannelOwnership.MANAGED_RUNTIME, lifecycle: ChannelLifecycle.RUNTIME, permissionSummary: [] };
const protectedPlan = compileApprovedGovernancePlan({ guildId: 'protected', compiledBy: 'admin', inventory: [protectedResource], desiredState: { resources: [] }, decisions: [{ guildId: 'protected', resourceId: 'runtime', resourceFingerprint: createResourceFingerprint(protectedResource), decision: 'DELETE', schemaVersion: 1 }], compiledAt: input.compiledAt });
assert.equal(protectedPlan.blockedReasons.includes('PROTECTED_DESTRUCTIVE_TARGET:runtime'), true);

const duplicateAdoption = snapshot.inventory.filter((resource) => resource.id === 'custom-12' || resource.id === 'custom-13').map((resource) => ({ guildId: 'duplicate', resourceId: resource.id, resourceFingerprint: createResourceFingerprint(resource), decision: 'ADOPT_CANONICAL', canonicalTargetKey: 'channel:dev', schemaVersion: 1 }));
const duplicatePlan = compileApprovedGovernancePlan({ guildId: 'duplicate', compiledBy: 'admin', inventory: snapshot.inventory, desiredState, decisions: [...decisions.filter((decision) => !decision.resourceId.startsWith('custom-')), ...duplicateAdoption], compiledAt: input.compiledAt });
assert.equal(duplicatePlan.status, 'BLOCKED');
assert.equal(duplicatePlan.blockedReasons.some((reason) => reason.includes('REVIEW_CONFLICT')), true);

const exactInventory = desiredState.resources.map((resource, index) => ({ id: `exact-${index}`, name: resource.displayName, type: resource.type, parentId: resource.parentKey ? `exact-${desiredState.resources.findIndex((candidate) => candidate.key === resource.parentKey)}` : null, parentCanonicalKey: resource.parentKey || null, canonicalKey: resource.key, purpose: resource.purpose, owner: resource.owner, lifecycle: resource.lifecycle, accessProfile: resource.accessProfile, accessRoleKey: resource.accessRoleKey, permissionSummary: [] }));
const noChanges = compileApprovedGovernancePlan({ guildId: 'exact', compiledBy: 'admin', inventory: exactInventory, desiredState, decisions: [], compiledAt: input.compiledAt });
assert.equal(noChanges.status, 'NO_CHANGES');
assert.equal(noChanges.operations.length, 0);

const categoryDesired = { resources: [
  { key: 'category:new', displayName: 'New category', type: 'category', parentKey: null, purpose: 'admin', owner: ChannelOwnership.MANAGED_CANONICAL, lifecycle: ChannelLifecycle.PERSISTENT, legacyNames: [], accessProfile: null, accessRoleKey: null },
  { key: 'channel:new', displayName: 'New channel', type: 'text', parentKey: 'category:new', purpose: 'admin', owner: ChannelOwnership.MANAGED_CANONICAL, lifecycle: ChannelLifecycle.PERSISTENT, legacyNames: [], accessProfile: null, accessRoleKey: null }
] };
const legacyCategory = { id: 'old-category', name: 'Old category', type: 'category', parentId: null, parentCanonicalKey: null, canonicalKey: null, purpose: 'unknown', owner: ChannelOwnership.MANAGED_CANONICAL, lifecycle: ChannelLifecycle.DEPRECATED, replacementKey: 'category:new', permissionSummary: [] };
const legacyChild = { id: 'old-child', name: 'Old child', type: 'text', parentId: 'old-category', parentCanonicalKey: null, canonicalKey: null, purpose: 'unknown', owner: ChannelOwnership.MANAGED_CANONICAL, lifecycle: ChannelLifecycle.DEPRECATED, replacementKey: 'channel:new', permissionSummary: [] };
const categoryPlan = compileApprovedGovernancePlan({ guildId: 'category', compiledBy: 'admin', inventory: [legacyCategory, legacyChild], desiredState: categoryDesired, decisions: [], compiledAt: input.compiledAt });
const deleteCategory = categoryPlan.operations.find((operation) => operation.type === 'DELETE_CATEGORY');
assert.equal(deleteCategory.dependencies.includes('DELETE_CHANNEL:old-child'), true);
console.log('Server governance approved-plan tests passed.');
