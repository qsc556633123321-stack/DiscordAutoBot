function assertGovernanceApprovedPlanStore(store) {
  for (const method of ['savePlan', 'loadLatestPlan', 'listPlans', 'listAudit', 'recordVerification']) if (typeof store?.[method] !== 'function') throw new Error(`GovernanceApprovedPlanStore.${method} is required`);
  return store;
}
module.exports = { assertGovernanceApprovedPlanStore };
