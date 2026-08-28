const assert = require('node:assert/strict');
const { GovernanceReviewApprovalState } = require('../../../src/domain/community/serverGovernanceReviewManifest');
const { GovernanceReviewDecisionState } = require('../../../src/domain/community/serverGovernanceReviewDecisionPolicy');
const { buildFullGuildDesiredState } = require('../../../src/domain/community/serverGovernanceDesiredState');
const { buildFullGuildGovernancePreview } = require('../../../src/application/community/createServerGovernancePlanUseCase');
const { createServerGovernanceReviewDecisionUseCase } = require('../../../src/application/community/serverGovernanceReviewDecisionUseCase');
const { createProductionReviewSnapshot } = require('../../fixtures/community/server-governance-production-review-snapshot');

function createStore() {
  const records = new Map(); const audit = new Map();
  return {
    listDecisions({ guildId }) { return [...(records.get(guildId)?.values() || [])]; },
    saveDecision({ record, actorId }) { const guild = records.get(record.guildId) || new Map(); const old = guild.get(record.resourceId); guild.set(record.resourceId, record); records.set(record.guildId, guild); audit.set(record.guildId, [...(audit.get(record.guildId) || []), { oldDecision: old?.decision || null, newDecision: record.decision, actorId }]); return record; },
    removeDecision({ guildId, resourceId, actorId }) { const guild = records.get(guildId) || new Map(); const old = guild.get(resourceId); guild.delete(resourceId); audit.set(guildId, [...(audit.get(guildId) || []), { oldDecision: old?.decision || null, newDecision: null, actorId }]); return Boolean(old); },
    listAudit({ guildId }) { return audit.get(guildId) || []; }
  };
}

const desiredState = buildFullGuildDesiredState();
const snapshot = createProductionReviewSnapshot(desiredState);
const plan = buildFullGuildGovernancePreview(snapshot).plan;
const store = createStore();
const useCase = createServerGovernanceReviewDecisionUseCase({ decisionStore: store, desiredState });
const guildId = 'guild-a';
const unknown = snapshot.inventory.find((resource) => resource.id === 'custom-12');
const compact = snapshot.inventory.find((resource) => resource.id === 'legacy-teamfight_tactics-0');
const voiceOnly = snapshot.inventory.find((resource) => resource.id === 'legacy-gtfo-extra-0');

let review = useCase.list({ guildId, inventory: snapshot.inventory, plan });
assert.equal(review.manifest.entries.filter((entry) => entry.decisionState === GovernanceReviewApprovalState.UNDECIDED).length, 79);
useCase.decide({ guildId, resource: compact, decision: GovernanceReviewApprovalState.KEEP, actorId: 'admin' });
useCase.decide({ guildId, resource: voiceOnly, decision: GovernanceReviewApprovalState.DELETE, actorId: 'admin' });
review = useCase.list({ guildId, inventory: snapshot.inventory, plan });
assert.equal(review.manifest.entries.find((entry) => entry.resourceId === compact.id).decisionState, GovernanceReviewApprovalState.KEEP);
assert.equal(review.manifest.entries.find((entry) => entry.resourceId === voiceOnly.id).decisionState, GovernanceReviewApprovalState.DELETE);
assert.equal(review.resolvedPlan.actions.some((action) => action.action === 'APPROVED_DELETE_INTENT' && action.resourceId === voiceOnly.id), true);
assert.equal(useCase.reset({ guildId, resourceId: compact.id, actorId: 'admin' }), true);
assert.equal(useCase.list({ guildId, inventory: snapshot.inventory, plan }).manifest.entries.find((entry) => entry.resourceId === compact.id).decisionState, GovernanceReviewApprovalState.UNDECIDED);
assert.throws(() => useCase.decide({ guildId, resource: unknown, decision: GovernanceReviewApprovalState.ADOPT_CANONICAL, canonicalTargetKey: 'missing', actorId: 'admin' }), /Unknown canonical target/);
const adoptionTarget = desiredState.resources.find((resource) => resource.type === unknown.type && resource.key === 'channel:dev');
useCase.decide({ guildId, resource: unknown, decision: GovernanceReviewApprovalState.ADOPT_CANONICAL, canonicalTargetKey: adoptionTarget.key, actorId: 'admin' });
assert.throws(() => useCase.decide({ guildId, resource: snapshot.inventory.find((resource) => resource.id === 'custom-13'), decision: GovernanceReviewApprovalState.ADOPT_CANONICAL, canonicalTargetKey: adoptionTarget.key, actorId: 'admin' }), /already adopted/);
const changedUnknown = { ...unknown, name: 'changed-name' };
assert.equal(useCase.getDecisionState(changedUnknown, store.listDecisions({ guildId }).find((record) => record.resourceId === unknown.id)), GovernanceReviewDecisionState.STALE);
const staleReview = useCase.list({ guildId, inventory: snapshot.inventory.map((resource) => resource.id === unknown.id ? changedUnknown : resource), plan });
assert.equal(staleReview.resolvedPlan.status, 'BLOCKED_REVIEW_DECISIONS');
const orphanReview = useCase.list({ guildId, inventory: snapshot.inventory.filter((resource) => resource.id !== unknown.id), plan });
assert.equal(orphanReview.manifest.entries.find((entry) => entry.resourceId === unknown.id).decisionState, GovernanceReviewDecisionState.ORPHANED_DECISION);
assert.equal(orphanReview.resolvedPlan.status, 'BLOCKED_REVIEW_DECISIONS');

const bulkStore = createStore();
const bulkUseCase = createServerGovernanceReviewDecisionUseCase({ decisionStore: bulkStore, desiredState });
const bulkReview = bulkUseCase.list({ guildId: 'guild-b', inventory: snapshot.inventory, plan });
const eligible = bulkReview.manifest.entries.filter((entry) => entry.ownership === 'USER_MANAGED');
assert.equal(eligible.length, 67);
assert.throws(() => bulkUseCase.bulkIgnoreUserManaged({ guildId: 'guild-b', entries: bulkReview.manifest.entries, actorId: 'admin', confirmation: 'IGNORE_66_RESOURCES' }), /Bulk confirmation required/);
assert.equal(bulkUseCase.bulkIgnoreUserManaged({ guildId: 'guild-b', entries: bulkReview.manifest.entries, actorId: 'admin', confirmation: 'IGNORE_67_RESOURCES' }).length, 67);
for (const entry of bulkReview.manifest.entries.filter((entry) => entry.action === 'REVIEW_DELETE')) bulkUseCase.decide({ guildId: 'guild-b', resource: entry.resource, decision: entry.reason.includes('voice_only') ? GovernanceReviewApprovalState.DELETE : GovernanceReviewApprovalState.KEEP, actorId: 'admin' });
const complete = bulkUseCase.list({ guildId: 'guild-b', inventory: snapshot.inventory, plan });
assert.equal(complete.resolvedPlan.counts.UNDECIDED || 0, 0);
assert.equal(complete.resolvedPlan.counts.STALE || 0, 0);
assert.equal(complete.resolvedPlan.blockers.length, 0);
assert.equal(complete.resolvedPlan.status, 'READY_FOR_EXECUTION_REVIEW');
assert.equal(bulkUseCase.listAudit({ guildId: 'guild-b' }).length, 79);
assert.equal(store.listDecisions({ guildId: 'other-guild' }).length, 0);
console.log('Server governance review decision workflow tests passed.');
