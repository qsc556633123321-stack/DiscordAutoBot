const GovernanceReviewApprovalState = Object.freeze({
  UNDECIDED: 'UNDECIDED',
  KEEP: 'KEEP',
  DELETE: 'DELETE',
  ADOPT_CANONICAL: 'ADOPT_CANONICAL',
  IGNORE_GOVERNANCE: 'IGNORE_GOVERNANCE'
});

const GovernanceReviewDecisionState = Object.freeze({
  ...GovernanceReviewApprovalState,
  STALE: 'STALE',
  ORPHANED_DECISION: 'ORPHANED_DECISION'
});

const PERSISTED_DECISIONS = new Set([
  GovernanceReviewApprovalState.KEEP,
  GovernanceReviewApprovalState.DELETE,
  GovernanceReviewApprovalState.ADOPT_CANONICAL,
  GovernanceReviewApprovalState.IGNORE_GOVERNANCE
]);

function createResourceFingerprint(resource = {}) {
  return JSON.stringify([
    resource.id,
    resource.type,
    resource.name,
    resource.parentId || null,
    resource.canonicalKey || null,
    resource.owner || 'UNKNOWN',
    resource.lifecycle || 'unknown'
  ]);
}

function assertPersistedDecision(decision) {
  if (!PERSISTED_DECISIONS.has(decision)) throw new Error(`Unsupported governance review decision: ${decision}`);
  return decision;
}

function getDecisionState(resource, record) {
  if (!record) return GovernanceReviewApprovalState.UNDECIDED;
  if (!resource) return GovernanceReviewDecisionState.ORPHANED_DECISION;
  return record.resourceFingerprint === createResourceFingerprint(resource) ? record.decision : GovernanceReviewDecisionState.STALE;
}

function validateAdoption({ resource, canonicalTargetKey, desiredState = { resources: [] }, decisions = [] } = {}) {
  if (!canonicalTargetKey) throw new Error('ADOPT_CANONICAL requires canonicalTargetKey');
  const target = (desiredState.resources || []).find((item) => item.key === canonicalTargetKey);
  if (!target) throw new Error(`Unknown canonical target: ${canonicalTargetKey}`);
  if (resource?.type !== target.type) throw new Error(`Incompatible canonical target: ${canonicalTargetKey}`);
  const duplicate = decisions.find((decision) => decision.resourceId !== resource.id && decision.decision === GovernanceReviewApprovalState.ADOPT_CANONICAL && decision.canonicalTargetKey === canonicalTargetKey);
  if (duplicate) throw new Error(`Canonical target already adopted: ${canonicalTargetKey}`);
  return target;
}

module.exports = {
  GovernanceReviewDecisionState,
  GovernanceReviewApprovalState,
  PERSISTED_DECISIONS,
  createResourceFingerprint,
  assertPersistedDecision,
  getDecisionState,
  validateAdoption
};
