function renderApprovedPlan(plan) {
  if (!plan) return 'No approved governance plan exists for this server.';
  const summary = plan.summary || {};
  return [`GOVERNANCE APPROVED PLAN`, `Status: ${plan.status}`, `Fingerprint: ${plan.planFingerprint}`, `Creates: ${(summary.CREATE_CATEGORY || 0) + (summary.CREATE_CHANNEL || 0)} | Moves: ${summary.MOVE_RESOURCE || 0} | Renames: ${summary.RENAME_RESOURCE || 0} | Permissions: ${summary.UPDATE_PERMISSIONS || 0}`, `Delete channels: ${summary.DELETE_CHANNEL || 0} | Delete categories: ${summary.DELETE_CATEGORY || 0}`, `Blockers: ${(plan.blockedReasons || []).join(', ') || 'None'}`, '', ...(plan.operations || []).map((operation) => `• ${operation.type} ${operation.resourceId || operation.canonicalTargetKey} [${operation.operationId}]`)].join('\n');
}
function renderPlanVerification(result) { return `PLAN VERIFICATION: ${result.status}\n${(result.blockers || []).join('\n') || 'No blockers.'}`; }
module.exports = { renderApprovedPlan, renderPlanVerification };
