const { GovernanceReviewApprovalState, buildGovernanceReviewManifest } = require('../../domain/community/serverGovernanceReviewManifest');
const {
  createResourceFingerprint,
  assertPersistedDecision,
  getDecisionState,
  validateAdoption
} = require('../../domain/community/serverGovernanceReviewDecisionPolicy');
const { assertGovernanceReviewDecisionStore } = require('./ports/GovernanceReviewDecisionStore');

const REVIEW_DECISION_SCHEMA_VERSION = 1;

function resolveGovernanceReviewPlan({ plan = { actions: [] }, manifest = { entries: [] } } = {}) {
  const entries = new Map((manifest.entries || []).map((entry) => [entry.resourceId, entry]));
  const actions = [];
  const blockers = [];
  const adoptedTargets = new Set();
  for (const action of plan.actions || []) {
    const entry = entries.get(action.resourceId);
    if (!entry) { actions.push(action); continue; }
    if (entry.decisionState === GovernanceReviewApprovalState.UNDECIDED || entry.decisionState === 'STALE' || entry.decisionState === 'ORPHANED_DECISION' || entry.decisionState === 'CONFLICT') {
      blockers.push(entry); actions.push(action); continue;
    }
    if (entry.decisionState === GovernanceReviewApprovalState.DELETE) {
      actions.push(Object.freeze({ action: 'APPROVED_DELETE_INTENT', resourceId: action.resourceId, reason: entry.reason }));
    } else if (entry.decisionState === GovernanceReviewApprovalState.ADOPT_CANONICAL) {
      adoptedTargets.add(entry.canonicalTargetKey);
      actions.push(Object.freeze({ action: 'ADOPT_CANONICAL_INTENT', resourceId: action.resourceId, targetKey: entry.canonicalTargetKey, reason: entry.reason }));
    }
  }
  const counts = (manifest.entries || []).reduce((result, entry) => ({ ...result, [entry.decisionState]: (result[entry.decisionState] || 0) + 1 }), {});
  return Object.freeze({ actions: Object.freeze(actions.filter((action) => !(action.action === 'CREATE' && adoptedTargets.has(action.targetKey)))), blockers: Object.freeze(blockers), counts: Object.freeze(counts), status: blockers.length ? 'BLOCKED_REVIEW_DECISIONS' : 'READY_FOR_EXECUTION_REVIEW' });
}

function createServerGovernanceReviewDecisionUseCase({ decisionStore, desiredState } = {}) {
  assertGovernanceReviewDecisionStore(decisionStore);
  function recordFor({ guildId, resource, decision, canonicalTargetKey, actorId, reasonAtDecision, currentDecisions }) {
    assertPersistedDecision(decision);
    if (decision === GovernanceReviewApprovalState.ADOPT_CANONICAL) validateAdoption({ resource, canonicalTargetKey, desiredState, decisions: currentDecisions });
    if (decision !== GovernanceReviewApprovalState.ADOPT_CANONICAL && canonicalTargetKey) throw new Error('canonicalTargetKey is only valid for ADOPT_CANONICAL');
    return Object.freeze({ guildId, resourceId: resource.id, resourceFingerprint: createResourceFingerprint(resource), resourceNameAtDecision: resource.name, parentIdAtDecision: resource.parentId || null, decision, canonicalTargetKey: canonicalTargetKey || null, reasonAtDecision: reasonAtDecision || null, decidedBy: actorId, decidedAt: new Date().toISOString(), schemaVersion: REVIEW_DECISION_SCHEMA_VERSION });
  }
  return Object.freeze({
    list({ guildId, inventory = [], plan }) {
      const decisions = decisionStore.listDecisions({ guildId });
      const manifest = buildGovernanceReviewManifest({ plan, inventory, decisions, desiredState });
      return Object.freeze({ decisions, manifest, resolvedPlan: resolveGovernanceReviewPlan({ plan, manifest }) });
    },
    decide({ guildId, resource, decision, canonicalTargetKey, actorId, reasonAtDecision }) {
      const currentDecisions = decisionStore.listDecisions({ guildId });
      const record = recordFor({ guildId, resource, decision, canonicalTargetKey, actorId, reasonAtDecision, currentDecisions });
      return decisionStore.saveDecision({ record, actorId });
    },
    reset({ guildId, resourceId, actorId }) { return decisionStore.removeDecision({ guildId, resourceId, actorId }); },
    bulkIgnoreUserManaged({ guildId, entries = [], actorId, confirmation }) {
      const eligible = entries.filter((entry) => entry.decisionState === GovernanceReviewApprovalState.UNDECIDED && entry.ownership === 'USER_MANAGED');
      const expected = `IGNORE_${eligible.length}_RESOURCES`;
      if (confirmation !== expected) throw new Error(`Bulk confirmation required: ${expected}`);
      const current = decisionStore.listDecisions({ guildId });
      return eligible.map((entry) => {
        const record = recordFor({ guildId, resource: entry.resource, decision: GovernanceReviewApprovalState.IGNORE_GOVERNANCE, actorId, reasonAtDecision: entry.reason, currentDecisions: current });
        return decisionStore.saveDecision({ record, actorId });
      });
    },
    listAudit({ guildId }) { return decisionStore.listAudit({ guildId }); },
    getDecisionState
  });
}

module.exports = { REVIEW_DECISION_SCHEMA_VERSION, createServerGovernanceReviewDecisionUseCase, resolveGovernanceReviewPlan };
