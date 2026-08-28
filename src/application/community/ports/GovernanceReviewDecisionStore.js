function assertGovernanceReviewDecisionStore(store) {
  for (const method of ['listDecisions', 'saveDecision', 'removeDecision', 'listAudit']) {
    if (typeof store?.[method] !== 'function') throw new Error(`GovernanceReviewDecisionStore.${method} is required`);
  }
  return store;
}

module.exports = { assertGovernanceReviewDecisionStore };
