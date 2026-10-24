function assertMethods(value, name, methods) { for (const method of methods) if (typeof value?.[method] !== 'function') throw new TypeError(`${name} requires ${method}`); return value; }
function assertGovernancePlanRepository(repository) { return assertMethods(repository, 'GovernancePlanRepository', ['listPlans', 'loadLatestPlan', 'listAudit']); }
function assertGovernanceDecisionRepository(repository) { return assertMethods(repository, 'GovernanceDecisionRepository', ['listDecisions', 'listAudit']); }
function assertGovernanceAuditRepository(repository) { return assertMethods(repository, 'GovernanceAuditRepository', ['listAudit']); }
module.exports = { assertGovernanceAuditRepository, assertGovernanceDecisionRepository, assertGovernancePlanRepository };
