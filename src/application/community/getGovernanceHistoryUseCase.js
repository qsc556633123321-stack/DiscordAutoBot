const { assertGovernancePlanRepository, assertGovernanceDecisionRepository, assertGovernanceAuditRepository } = require('./ports/GovernancePersistenceRepositories');
function planStatus(record) { const status = record?.storageStatus || record?.plan?.status || 'UNKNOWN'; if (status === 'ACTIVE') return 'PENDING_REVIEW'; if (status === 'SUPERSEDED') return 'STALE'; return status; }
function createGovernanceHistoryUseCase({ planRepository, decisionRepository, auditRepository } = {}) {
  assertGovernancePlanRepository(planRepository); assertGovernanceDecisionRepository(decisionRepository); assertGovernanceAuditRepository(auditRepository);
  return Object.freeze({ getHistory({ guildId }) { const plans = planRepository.listPlans({ guildId }).map((record) => Object.freeze({ status: planStatus(record), planFingerprint: record.plan?.planFingerprint || null, reviewedBy: record.createdBy || null, reviewedAt: record.createdAt || null, risk: record.plan?.status === 'BLOCKED' ? 'high' : 'medium' })); return Object.freeze({ guildId, plans: Object.freeze(plans), decisions: decisionRepository.listDecisions({ guildId }), audit: auditRepository.listAudit({ guildId }) }); } });
}
module.exports = { createGovernanceHistoryUseCase };
