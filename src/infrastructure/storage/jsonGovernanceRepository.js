const { createJsonGovernanceApprovedPlanStore } = require('./jsonGovernanceApprovedPlanStore');
const { createJsonGovernanceReviewDecisionStore } = require('./jsonGovernanceReviewDecisionStore');
const { createJsonGovernanceExecutionTransactionStore } = require('./jsonGovernanceExecutionTransactionStore');

function createJsonGovernanceRepositories({ planStore = createJsonGovernanceApprovedPlanStore(), decisionStore = createJsonGovernanceReviewDecisionStore(), transactionStore = createJsonGovernanceExecutionTransactionStore() } = {}) {
  return Object.freeze({
    planRepository: Object.freeze({ listPlans: ({ guildId }) => planStore.listPlans({ guildId }), loadLatestPlan: ({ guildId }) => planStore.loadLatestPlan({ guildId }), listAudit: ({ guildId }) => planStore.listAudit({ guildId }) }),
    decisionRepository: Object.freeze({ listDecisions: ({ guildId }) => decisionStore.listDecisions({ guildId }), listAudit: ({ guildId }) => decisionStore.listAudit({ guildId }) }),
    auditRepository: Object.freeze({ listAudit: ({ guildId }) => Object.freeze([...planStore.listAudit({ guildId }), ...decisionStore.listAudit({ guildId }), ...transactionStore.listAudit({ guildId })].map((event) => Object.freeze({ ...event, guildId })).sort((a, b) => String(b.timestamp || '').localeCompare(String(a.timestamp || '')))) })
  });
}
module.exports = { createJsonGovernanceRepositories };
