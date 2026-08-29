function assertGovernanceExecutionTransactionStore(store) {
  for (const method of ['acquireLock', 'releaseLock', 'findSucceededPlan', 'findActiveTransaction', 'createTransaction', 'updateTransaction', 'recordAudit', 'recoverInterrupted']) if (typeof store?.[method] !== 'function') throw new TypeError(`GovernanceExecutionTransactionStore requires ${method}`);
  return store;
}
module.exports = { assertGovernanceExecutionTransactionStore };
