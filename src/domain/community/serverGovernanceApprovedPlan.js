const { fingerprint, resourceFingerprint } = require('./serverGovernanceExecutionPolicy');

const APPROVED_PLAN_SCHEMA_VERSION = 1;
const ApprovedPlanStatus = Object.freeze({ BLOCKED: 'BLOCKED', READY_FOR_EXECUTION_REVIEW: 'READY_FOR_EXECUTION_REVIEW', NO_CHANGES: 'NO_CHANGES' });
const ApprovedOperationType = Object.freeze({ CREATE_CATEGORY: 'CREATE_CATEGORY', CREATE_CHANNEL: 'CREATE_CHANNEL', RENAME_RESOURCE: 'RENAME_RESOURCE', MOVE_RESOURCE: 'MOVE_RESOURCE', UPDATE_PERMISSIONS: 'UPDATE_PERMISSIONS', DELETE_CHANNEL: 'DELETE_CHANNEL', DELETE_CATEGORY: 'DELETE_CATEGORY' });
const RollbackClass = Object.freeze({ REVERSIBLE: 'REVERSIBLE', PARTIALLY_REVERSIBLE: 'PARTIALLY_REVERSIBLE', IRREVERSIBLE: 'IRREVERSIBLE' });

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stable(value[key])]));
  return value;
}
function inventoryFingerprint(inventory = []) { return fingerprint([...inventory].map((resource) => ({ ...resourceFingerprint(resource), canonicalKey: resource.canonicalKey || null, owner: resource.owner || 'UNKNOWN', lifecycle: resource.lifecycle || 'unknown', accessProfile: resource.accessProfile || null, accessRoleKey: resource.accessRoleKey || null })).sort((left, right) => String(left.id).localeCompare(String(right.id)))); }
function desiredStateFingerprint(desiredState = {}) { return fingerprint((desiredState.resources || []).map(stable).sort((left, right) => left.key.localeCompare(right.key))); }
function decisionSetFingerprint(decisions = []) { return fingerprint((decisions || []).map((decision) => ({ guildId: decision.guildId, resourceId: decision.resourceId, resourceFingerprint: decision.resourceFingerprint, decision: decision.decision, canonicalTargetKey: decision.canonicalTargetKey || null, schemaVersion: decision.schemaVersion })).sort((left, right) => left.resourceId.localeCompare(right.resourceId))); }
function rollbackClass(type) {
  if ([ApprovedOperationType.RENAME_RESOURCE, ApprovedOperationType.MOVE_RESOURCE].includes(type)) return RollbackClass.REVERSIBLE;
  if (type === ApprovedOperationType.UPDATE_PERMISSIONS || type === ApprovedOperationType.CREATE_CATEGORY || type === ApprovedOperationType.CREATE_CHANNEL) return RollbackClass.PARTIALLY_REVERSIBLE;
  return RollbackClass.IRREVERSIBLE;
}
function createApprovedOperation({ operationId, type, resourceId = null, canonicalTargetKey = null, currentSnapshot = null, expectedSnapshot = null, reason, humanDecisionEvidence = null, dependencies = [], permission = null, replacementEvidence = null } = {}) {
  const rollback = rollbackClass(type);
  return Object.freeze({ operationId, type, resourceId, canonicalTargetKey, currentSnapshot: currentSnapshot ? Object.freeze({ ...currentSnapshot }) : null, expectedSnapshot: expectedSnapshot ? Object.freeze({ ...expectedSnapshot }) : null, reason, humanDecisionEvidence, dependencies: Object.freeze([...new Set(dependencies)].sort()), destructive: [ApprovedOperationType.DELETE_CHANNEL, ApprovedOperationType.DELETE_CATEGORY].includes(type), reversible: rollback === RollbackClass.REVERSIBLE, rollbackClass: rollback, rollbackMetadata: Object.freeze({ previousName: currentSnapshot?.name || null, previousParentId: currentSnapshot?.parentId || null, previousPermissions: currentSnapshot?.permissionSummary || [], resourceId, resourceType: currentSnapshot?.type || expectedSnapshot?.type || null }), permission, replacementEvidence });
}
function createApprovedGovernancePlan({ guildId, compiledAt, compiledBy, inventoryFingerprint: inventory, desiredStateFingerprint: desired, decisionSetFingerprint: decisions, operations = [], blockedReasons = [] } = {}) {
  // The compiler already supplies a deterministic safety order; preserve it so
  // irreversible deletes cannot move ahead of reversible work by identifier.
  const normalizedOperations = [...operations];
  const logical = normalizedOperations.map(({ operationId, type, resourceId, canonicalTargetKey, currentSnapshot, expectedSnapshot, reason, humanDecisionEvidence, dependencies, permission, replacementEvidence }) => ({ operationId, type, resourceId, canonicalTargetKey, currentSnapshot, expectedSnapshot, reason, humanDecisionEvidence, dependencies, permission, replacementEvidence }));
  const planFingerprint = fingerprint({ inventory, desired, decisions, operations: logical });
  const status = blockedReasons.length ? ApprovedPlanStatus.BLOCKED : normalizedOperations.length ? ApprovedPlanStatus.READY_FOR_EXECUTION_REVIEW : ApprovedPlanStatus.NO_CHANGES;
  const summary = normalizedOperations.reduce((result, operation) => ({ ...result, [operation.type]: (result[operation.type] || 0) + 1 }), {});
  return Object.freeze({ schemaVersion: APPROVED_PLAN_SCHEMA_VERSION, guildId, compiledAt, compiledBy, inventoryFingerprint: inventory, desiredStateFingerprint: desired, decisionSetFingerprint: decisions, planFingerprint, summary: Object.freeze(summary), operations: Object.freeze(normalizedOperations), blockedReasons: Object.freeze([...new Set(blockedReasons)].sort()), status });
}
function isApprovedPlanFingerprintValid(plan) {
  if (!plan) return false;
  const operations = (plan.operations || []).map(({ operationId, type, resourceId, canonicalTargetKey, currentSnapshot, expectedSnapshot, reason, humanDecisionEvidence, dependencies, permission, replacementEvidence }) => ({ operationId, type, resourceId, canonicalTargetKey, currentSnapshot, expectedSnapshot, reason, humanDecisionEvidence, dependencies, permission, replacementEvidence }));
  return plan.planFingerprint === fingerprint({ inventory: plan.inventoryFingerprint, desired: plan.desiredStateFingerprint, decisions: plan.decisionSetFingerprint, operations });
}
function verifyApprovedGovernancePlan({ plan, freshInventory, currentDesiredState, currentDecisions } = {}) {
  const blockers = [];
  if (!plan) blockers.push('PLAN_NOT_FOUND');
  else {
    if (inventoryFingerprint(freshInventory) !== plan.inventoryFingerprint) blockers.push('PLAN_STALE');
    if (desiredStateFingerprint(currentDesiredState) !== plan.desiredStateFingerprint) blockers.push('PLAN_OBSOLETE');
    if (decisionSetFingerprint(currentDecisions) !== plan.decisionSetFingerprint) blockers.push('PLAN_DECISIONS_CHANGED');
    if (plan.status === ApprovedPlanStatus.BLOCKED) blockers.push('PLAN_BLOCKED');
  }
  return Object.freeze({ status: blockers.length ? 'BLOCKED' : 'VALID', blockers: Object.freeze(blockers) });
}

module.exports = { APPROVED_PLAN_SCHEMA_VERSION, ApprovedPlanStatus, ApprovedOperationType, RollbackClass, createApprovedGovernancePlan, createApprovedOperation, decisionSetFingerprint, desiredStateFingerprint, inventoryFingerprint, isApprovedPlanFingerprintValid, verifyApprovedGovernancePlan };
