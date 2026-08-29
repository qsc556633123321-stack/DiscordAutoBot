const { isProtectedResource } = require('../../domain/community/channelGovernance');
const { ApprovedOperationType, ApprovedPlanStatus, verifyApprovedGovernancePlan } = require('../../domain/community/serverGovernanceApprovedPlan');
const { GovernanceExecutionFailure, GovernanceOperationState, GovernanceTransactionState, createExecutionReceipt, orderOperations, requiredConfirmation } = require('../../domain/community/governanceExecutionTransaction');
const { assertGovernanceExecutionTransactionStore } = require('./ports/GovernanceExecutionTransactionStore');
const { assertGovernancePlanExecutionGateway } = require('./ports/GovernancePlanExecutionGateway');

function now() { return new Date().toISOString(); }
function failure(code, detail = null) { return Object.freeze({ code, detail }); }
function matches(current, expected) { if (!expected) return true; return (!expected.id || current?.id === expected.id) && (!expected.type || current?.type === expected.type) && (!expected.name || current?.name === expected.name) && (!expected.parentId || current?.parentId === expected.parentId); }
function postMatches(operation, current) { const expected = operation.expectedSnapshot || {}; if (!current) return false; if (expected.type && current.type !== expected.type) return false; if (expected.name && current.name !== expected.name) return false; return true; }
function isIrreversible(operation) { return [ApprovedOperationType.DELETE_CHANNEL, ApprovedOperationType.DELETE_CATEGORY].includes(operation.type); }
function transactionId(plan) { return `gov-tx-${plan.planFingerprint}-${Date.now()}`; }
async function invoke(gateway, operation, guildId, createdIds) {
  const resourceId = operation.resourceId || createdIds.get(operation.canonicalTargetKey);
  if (operation.type === ApprovedOperationType.CREATE_CATEGORY) return gateway.createCategory({ guildId, operation });
  if (operation.type === ApprovedOperationType.CREATE_CHANNEL) return gateway.createChannel({ guildId, operation, parentResourceId: createdIds.get(operation.expectedSnapshot?.parentCanonicalKey) || null });
  if (operation.type === ApprovedOperationType.MOVE_RESOURCE) return gateway.moveResource({ guildId, resourceId, operation, parentResourceId: createdIds.get(operation.expectedSnapshot?.parentCanonicalKey) || null });
  if (operation.type === ApprovedOperationType.RENAME_RESOURCE) return gateway.renameResource({ guildId, resourceId, operation });
  if (operation.type === ApprovedOperationType.UPDATE_PERMISSIONS) return gateway.updatePermissions({ guildId, resourceId, operation });
  if (operation.type === ApprovedOperationType.DELETE_CHANNEL) return gateway.deleteChannel({ guildId, resourceId, operation });
  return gateway.deleteCategory({ guildId, resourceId, operation });
}
async function rollback(gateway, guildId, completed, createdIds) {
  const results = [];
  for (const item of [...completed].reverse()) {
    const { operation, resourceId, before } = item;
    if (isIrreversible(operation)) continue;
    try {
      if ([ApprovedOperationType.CREATE_CATEGORY, ApprovedOperationType.CREATE_CHANNEL].includes(operation.type)) {
        const current = await gateway.readResourceState({ guildId, resourceId });
        if (!current || current.name !== operation.expectedSnapshot?.name || current.type !== operation.expectedSnapshot?.type) throw new Error('CREATED_RESOURCE_EXTERNALLY_CHANGED');
        if (operation.type === ApprovedOperationType.CREATE_CATEGORY) await gateway.deleteCategory({ guildId, resourceId, operation }); else await gateway.deleteChannel({ guildId, resourceId, operation });
      } else if (operation.type === ApprovedOperationType.RENAME_RESOURCE) await gateway.renameResource({ guildId, resourceId, operation: { ...operation, expectedSnapshot: before } });
      else if (operation.type === ApprovedOperationType.MOVE_RESOURCE) await gateway.moveResource({ guildId, resourceId, operation: { ...operation, expectedSnapshot: before }, parentResourceId: before.parentId });
      else if (operation.type === ApprovedOperationType.UPDATE_PERMISSIONS) await gateway.updatePermissions({ guildId, resourceId, operation: { ...operation, permission: { previous: before.permissionSummary || [] } } });
      results.push(Object.freeze({ operationId: operation.operationId, state: GovernanceOperationState.ROLLED_BACK }));
    } catch (error) { results.push(Object.freeze({ operationId: operation.operationId, state: GovernanceOperationState.ROLLBACK_FAILED, failure: failure(GovernanceExecutionFailure.ROLLBACK_FAILED, error.message) })); }
  }
  return Object.freeze(results);
}
function createExecuteApprovedGovernancePlanUseCase({ transactionStore, mutationGateway, executionEnabled = false } = {}) {
  assertGovernanceExecutionTransactionStore(transactionStore); assertGovernancePlanExecutionGateway(mutationGateway);
  return Object.freeze({ async execute({ guildId, actorId, planRecord, confirmation, freshDesiredState, freshDecisions }) {
    const plan = planRecord?.plan; const startedAt = now();
    const abort = (code) => createExecutionReceipt({ transactionId: null, guildId, planFingerprint: plan?.planFingerprint || null, actorId, startedAt, finishedAt: now(), status: GovernanceTransactionState.ABORTED, finalVerification: failure(code) });
    if (!executionEnabled) return abort(GovernanceExecutionFailure.FEATURE_DISABLED);
    if (!plan || plan.status !== ApprovedPlanStatus.READY_FOR_EXECUTION_REVIEW) return abort(GovernanceExecutionFailure.PLAN_STALE);
    if (planRecord.storageStatus !== 'ACTIVE') return abort(GovernanceExecutionFailure.PLAN_SUPERSEDED);
    if (confirmation !== requiredConfirmation(plan.planFingerprint)) return abort(GovernanceExecutionFailure.CONFIRMATION_MISMATCH);
    if (transactionStore.findSucceededPlan({ guildId, planFingerprint: plan.planFingerprint })) return abort(GovernanceExecutionFailure.PLAN_ALREADY_EXECUTED);
    if (transactionStore.findActiveTransaction({ guildId })) return abort(GovernanceExecutionFailure.EXECUTION_LOCKED);
    const freshInventory = await mutationGateway.readInventory({ guildId });
    const verification = verifyApprovedGovernancePlan({ plan, freshInventory, currentDesiredState: freshDesiredState, currentDecisions: freshDecisions });
    if (verification.status !== 'VALID') return abort(verification.blockers[0]);
    let ordered;
    try { ordered = orderOperations(plan.operations); } catch (error) { return abort(GovernanceExecutionFailure.DEPENDENCY_FAILURE); }
    if (!transactionStore.acquireLock({ guildId, planFingerprint: plan.planFingerprint })) return abort(GovernanceExecutionFailure.EXECUTION_LOCKED);
    const id = transactionId(plan); const transaction = { transactionId: id, guildId, planFingerprint: plan.planFingerprint, actorId, status: GovernanceTransactionState.LOCKED, startedAt, operations: [] };
    transactionStore.createTransaction({ transaction }); transactionStore.recordAudit({ guildId, transactionId: id, planFingerprint: plan.planFingerprint, actorId, event: 'LOCKED', timestamp: now() });
    const completed = []; const operationResults = []; const createdIds = new Map(); const expectedStates = new Map(); let irreversibleEntered = false;
    try {
      transactionStore.updateTransaction({ transactionId: id, patch: { status: GovernanceTransactionState.EXECUTING } });
      for (const operation of ordered) {
        if (isIrreversible(operation) && !irreversibleEntered) { irreversibleEntered = true; transactionStore.recordAudit({ guildId, transactionId: id, planFingerprint: plan.planFingerprint, actorId, event: 'IRREVERSIBLE_PHASE_ENTERED', timestamp: now() }); }
        const resourceId = operation.resourceId || createdIds.get(operation.canonicalTargetKey) || null;
        const before = resourceId ? await mutationGateway.readResourceState({ guildId, resourceId }) : null;
        const expectedBefore = expectedStates.get(resourceId) || operation.currentSnapshot;
        if (operation.resourceId && !matches(before, expectedBefore)) throw Object.assign(new Error('precondition'), { code: GovernanceExecutionFailure.RESOURCE_PRECONDITION_FAILED, operation });
        if (isIrreversible(operation)) {
          if (isProtectedResource(before || {})) throw Object.assign(new Error('protected'), { code: GovernanceExecutionFailure.PROTECTED_RESOURCE, operation });
          if (operation.type === ApprovedOperationType.DELETE_CATEGORY && (await mutationGateway.readInventory({ guildId })).some((resource) => resource.parentId === resourceId)) throw Object.assign(new Error('children'), { code: GovernanceExecutionFailure.UNEXPECTED_CHILD_RESOURCE, operation });
        }
        const result = await invoke(mutationGateway, operation, guildId, createdIds);
        const resultingResourceId = result?.resourceId || resourceId;
        if ([ApprovedOperationType.CREATE_CATEGORY, ApprovedOperationType.CREATE_CHANNEL].includes(operation.type)) createdIds.set(operation.canonicalTargetKey, resultingResourceId);
        const after = isIrreversible(operation) ? null : await mutationGateway.readResourceState({ guildId, resourceId: resultingResourceId });
        if (!isIrreversible(operation) && !postMatches(operation, after)) throw Object.assign(new Error('postcondition'), { code: GovernanceExecutionFailure.POSTCONDITION_FAILED, operation });
        expectedStates.set(resultingResourceId, operation.expectedSnapshot || expectedBefore);
        const operationResult = Object.freeze({ operationId: operation.operationId, state: GovernanceOperationState.SUCCEEDED, startedAt: now(), finishedAt: now(), resultingResourceId }); operationResults.push(operationResult); completed.push({ operation, resourceId: resultingResourceId, before });
      }
      const receipt = createExecutionReceipt({ transactionId: id, guildId, planFingerprint: plan.planFingerprint, actorId, startedAt, finishedAt: now(), status: GovernanceTransactionState.SUCCEEDED, operationResults, irreversibleOperationsCompleted: completed.filter((item) => isIrreversible(item.operation)).map((item) => item.operation.operationId), finalVerification: Object.freeze({ status: 'VERIFIED' }), auditReference: id });
      transactionStore.updateTransaction({ transactionId: id, patch: { status: receipt.status, receipt } }); return receipt;
    } catch (error) {
      const failureCode = error.code || GovernanceExecutionFailure.DISCORD_WRITE_FAILED; operationResults.push(Object.freeze({ operationId: error.operation?.operationId || null, state: GovernanceOperationState.FAILED, failure: failure(failureCode, error.message), finishedAt: now() }));
      transactionStore.updateTransaction({ transactionId: id, patch: { status: GovernanceTransactionState.ROLLING_BACK } });
      const rollbackResults = await rollback(mutationGateway, guildId, completed, createdIds); const irreversible = completed.filter((item) => isIrreversible(item.operation)).map((item) => item.operation.operationId);
      const rollbackFailed = rollbackResults.some((item) => item.state === GovernanceOperationState.ROLLBACK_FAILED);
      const status = irreversible.length || rollbackFailed ? GovernanceTransactionState.PARTIAL_ROLLBACK : GovernanceTransactionState.ROLLED_BACK;
      const receipt = createExecutionReceipt({ transactionId: id, guildId, planFingerprint: plan.planFingerprint, actorId, startedAt, finishedAt: now(), status, operationResults, rollbackResults, irreversibleOperationsCompleted: irreversible, finalVerification: failure(failureCode), auditReference: id }); transactionStore.updateTransaction({ transactionId: id, patch: { status, receipt } }); return receipt;
    } finally { transactionStore.releaseLock({ guildId }); }
  }, recoverInterrupted({ guildId }) { return transactionStore.recoverInterrupted({ guildId }); } });
}
module.exports = { createExecuteApprovedGovernancePlanUseCase };
