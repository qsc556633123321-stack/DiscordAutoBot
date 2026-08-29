const { fingerprint } = require('./serverGovernanceExecutionPolicy');

const GovernanceTransactionState = Object.freeze({ PENDING: 'PENDING', VERIFYING: 'VERIFYING', LOCKED: 'LOCKED', EXECUTING: 'EXECUTING', ROLLING_BACK: 'ROLLING_BACK', SUCCEEDED: 'SUCCEEDED', FAILED: 'FAILED', ROLLED_BACK: 'ROLLED_BACK', PARTIAL_ROLLBACK: 'PARTIAL_ROLLBACK', ABORTED: 'ABORTED', INTERRUPTED_REQUIRES_REVIEW: 'INTERRUPTED_REQUIRES_REVIEW' });
const GovernanceOperationState = Object.freeze({ PENDING: 'PENDING', RUNNING: 'RUNNING', SUCCEEDED: 'SUCCEEDED', FAILED: 'FAILED', ROLLED_BACK: 'ROLLED_BACK', ROLLBACK_FAILED: 'ROLLBACK_FAILED', SKIPPED: 'SKIPPED' });
const GovernanceExecutionFailure = Object.freeze({ PLAN_STALE: 'PLAN_STALE', PLAN_INTEGRITY_FAILED: 'PLAN_INTEGRITY_FAILED', PLAN_SUPERSEDED: 'PLAN_SUPERSEDED', PLAN_ALREADY_EXECUTED: 'PLAN_ALREADY_EXECUTED', EXECUTION_LOCKED: 'EXECUTION_LOCKED', CONFIRMATION_MISMATCH: 'CONFIRMATION_MISMATCH', FEATURE_DISABLED: 'FEATURE_DISABLED', RESOURCE_PRECONDITION_FAILED: 'RESOURCE_PRECONDITION_FAILED', PROTECTED_RESOURCE: 'PROTECTED_RESOURCE', DISCORD_WRITE_FAILED: 'DISCORD_WRITE_FAILED', POSTCONDITION_FAILED: 'POSTCONDITION_FAILED', ROLLBACK_FAILED: 'ROLLBACK_FAILED', UNEXPECTED_CHILD_RESOURCE: 'UNEXPECTED_CHILD_RESOURCE', DEPENDENCY_FAILURE: 'DEPENDENCY_FAILURE' });

function requiredConfirmation(planFingerprint) { return `EXECUTE_${String(planFingerprint).slice(0, 12)}`; }
function orderOperations(operations = []) {
  const byId = new Map(operations.map((operation) => [operation.operationId, operation]));
  const ordered = []; const visiting = []; const visited = new Set();
  function visit(id) {
    if (visiting.includes(id)) throw new Error(`${GovernanceExecutionFailure.DEPENDENCY_FAILURE}:${id}`);
    if (visited.has(id)) return;
    const operation = byId.get(id);
    if (!operation) throw new Error(`${GovernanceExecutionFailure.DEPENDENCY_FAILURE}:${id}`);
    visiting.push(id);
    for (const dependency of operation.dependencies || []) visit(dependency);
    visiting.splice(visiting.indexOf(id), 1); visited.add(id); ordered.push(operation);
  }
  for (const operation of operations) visit(operation.operationId);
  return Object.freeze(ordered);
}
function createExecutionReceipt({ transactionId, guildId, planFingerprint, actorId, startedAt, finishedAt, status, operationResults = [], rollbackResults = [], irreversibleOperationsCompleted = [], finalVerification = null, auditReference = null } = {}) {
  return Object.freeze({ transactionId, guildId, planFingerprint, actorId, startedAt, finishedAt, status, operationResults: Object.freeze([...operationResults]), rollbackResults: Object.freeze([...rollbackResults]), irreversibleOperationsCompleted: Object.freeze([...irreversibleOperationsCompleted]), finalVerification, auditReference, receiptFingerprint: fingerprint({ transactionId, guildId, planFingerprint, actorId, startedAt, finishedAt, status, operationResults, rollbackResults, irreversibleOperationsCompleted, finalVerification }) });
}
module.exports = { GovernanceExecutionFailure, GovernanceOperationState, GovernanceTransactionState, createExecutionReceipt, orderOperations, requiredConfirmation };
