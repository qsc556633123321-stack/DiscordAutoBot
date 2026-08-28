const { GovernanceAction } = require('../../domain/community/channelGovernance');
const { EXECUTABLE_ACTIONS, ExecutionMode, ExecutionStatus, actionOrder, buildPermissionReconciliation, fingerprint, isAutomaticDeleteAllowed, resourceFingerprint } = require('../../domain/community/serverGovernanceExecutionPolicy');
const { assertDiscordGuildStructureMutationGateway } = require('./ports/DiscordGuildStructureMutationGateway');

function desiredByKey(desiredState = {}) { return new Map((desiredState.resources || []).map((resource) => [resource.key, resource])); }
function makeOperationId() { return `governance-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`; }

function prepareGovernanceExecutionPlan({ plan, desiredState, inventory = [] } = {}) {
  const desired = desiredByKey(desiredState);
  const byId = new Map(inventory.map((resource) => [resource.id, resource]));
  const blocked = (plan?.actions || []).filter((action) => [GovernanceAction.REVIEW, GovernanceAction.REVIEW_DELETE, GovernanceAction.CONFLICT].includes(action.action));
  const operations = (plan?.actions || []).filter((action) => EXECUTABLE_ACTIONS.includes(action.action)).map((action, index) => {
    const target = desired.get(action.targetKey) || null;
    const current = action.resourceId ? byId.get(action.resourceId) || null : null;
    return Object.freeze({ actionId: `action-${index + 1}`, type: action.action, targetKey: action.targetKey || null, resourceId: action.resourceId || null, reason: action.reason, target, expected: current ? resourceFingerprint(current) : null, permission: action.action === GovernanceAction.PERMISSION_CHANGE && target ? buildPermissionReconciliation(target) : null, order: actionOrder(action, target) });
  }).sort((left, right) => left.order - right.order || left.actionId.localeCompare(right.actionId));
  return Object.freeze({ operations: Object.freeze(operations), blockedActions: Object.freeze(blocked), planFingerprint: fingerprint({ actions: operations.map(({ actionId, type, targetKey, resourceId, expected, permission }) => ({ actionId, type, targetKey, resourceId, expected, permission })) }) });
}

function matchesExpected(current, expected) { return JSON.stringify(resourceFingerprint(current || {})) === JSON.stringify(expected || {}); }
function summarize(results) {
  const summary = { created: 0, moved: 0, renamed: 0, permissionChanged: 0, deletedChannels: 0, deletedCategories: 0, blocked: 0, failed: 0 };
  for (const result of results) {
    if (result.status === ExecutionStatus.BLOCKED) summary.blocked += 1;
    if (result.status === ExecutionStatus.FAILED) summary.failed += 1;
    if (result.status !== ExecutionStatus.SUCCESS) continue;
    if (result.type === GovernanceAction.CREATE) summary.created += 1;
    if (result.type === GovernanceAction.MOVE) summary.moved += 1;
    if (result.type === GovernanceAction.RENAME) summary.renamed += 1;
    if (result.type === GovernanceAction.PERMISSION_CHANGE) summary.permissionChanged += 1;
    if (result.type === GovernanceAction.SAFE_DELETE) {
      if (result.target?.type === 'category') summary.deletedCategories += 1;
      else summary.deletedChannels += 1;
    }
  }
  return Object.freeze(summary);
}

function preflightGovernanceExecution({ approvedPlan, snapshot, requiredRoleKeys = [] } = {}) {
  const reasons = [];
  if (!snapshot?.guildExists) reasons.push('GUILD_NOT_FOUND');
  for (const permission of ['ManageChannels', 'ManageRoles', 'ViewChannel']) if (!snapshot?.permissions?.[permission]) reasons.push(`MISSING_${permission.toUpperCase()}`);
  for (const roleKey of requiredRoleKeys) {
    const principal = snapshot?.rolesByKey?.[roleKey];
    if (!principal || (Array.isArray(principal) && principal.length === 0)) reasons.push(`MISSING_ROLE:${roleKey}`);
  }
  if ((approvedPlan?.blockedActions || []).length) reasons.push('UNAPPROVED_REVIEW_ACTIONS');
  const inventory = new Map((snapshot?.inventory || []).map((resource) => [resource.id, resource]));
  for (const operation of approvedPlan?.operations || []) {
    if (operation.expected && !matchesExpected(inventory.get(operation.resourceId), operation.expected)) reasons.push(`STALE_PLAN:${operation.actionId}`);
    if (operation.type === GovernanceAction.SAFE_DELETE && !isAutomaticDeleteAllowed(inventory.get(operation.resourceId))) reasons.push(`PROTECTED_DELETE:${operation.actionId}`);
  }
  return Object.freeze({ ok: reasons.length === 0, reasons: Object.freeze(reasons) });
}

function createServerGovernanceExecutionUseCase({ mutationGateway, desiredState } = {}) {
  assertDiscordGuildStructureMutationGateway(mutationGateway);
  async function executeOperation(operation, guildId, mode) {
    if (mode === ExecutionMode.DRY_RUN) return Object.freeze({ actionId: operation.actionId, type: operation.type, target: operation.target, status: ExecutionStatus.SUCCESS, dryRun: true, permission: operation.permission });
    if (operation.type === GovernanceAction.CREATE) {
      const method = operation.target.type === 'category' ? 'createCategory' : operation.target.type === 'voice' ? 'createVoiceChannel' : 'createTextChannel';
      await mutationGateway[method]({ guildId, target: operation.target });
    } else if (operation.type === GovernanceAction.MOVE) await mutationGateway.moveChannel({ guildId, resourceId: operation.resourceId, parentKey: operation.target.parentKey });
    else if (operation.type === GovernanceAction.RENAME) await mutationGateway.renameChannel({ guildId, resourceId: operation.resourceId, name: operation.target.displayName });
    else if (operation.type === GovernanceAction.PERMISSION_CHANGE) await mutationGateway[operation.target.type === 'category' ? 'applyCategoryPermissions' : 'applyChannelPermissions']({ guildId, resourceId: operation.resourceId, permission: operation.permission });
    else if (operation.type === GovernanceAction.SAFE_DELETE) await mutationGateway[operation.target?.type === 'category' ? 'deleteCategory' : 'deleteChannel']({ guildId, resourceId: operation.resourceId, target: operation.target });
    return Object.freeze({ actionId: operation.actionId, type: operation.type, target: operation.target, status: ExecutionStatus.SUCCESS, permission: operation.permission });
  }
  return Object.freeze({
    async execute({ guildId, plan, inventory, mode = ExecutionMode.DRY_RUN } = {}) {
      if (!Object.values(ExecutionMode).includes(mode)) throw new TypeError(`Unsupported execution mode: ${mode}`);
      const approvedPlan = prepareGovernanceExecutionPlan({ plan, desiredState, inventory });
      const snapshot = await mutationGateway.readExecutionSnapshot({ guildId });
      const requiredRoleKeys = [...new Set((desiredState.resources || []).flatMap((resource) => buildPermissionReconciliation(resource).overwrites.map((directive) => directive.roleKey)).filter((roleKey) => roleKey !== 'everyone'))];
      const preflight = preflightGovernanceExecution({ approvedPlan, snapshot, requiredRoleKeys });
      const startedAt = new Date().toISOString();
      if (!preflight.ok) return Object.freeze({ operationId: makeOperationId(), planFingerprint: approvedPlan.planFingerprint, mode, startedAt, finishedAt: new Date().toISOString(), preflight, results: Object.freeze([]), summary: summarize([]) });
      const results = [];
      let destructiveStarted = false;
      for (const operation of approvedPlan.operations) {
        if (operation.type === GovernanceAction.SAFE_DELETE && results.some((result) => result.status === ExecutionStatus.FAILED)) break;
        if (operation.type === GovernanceAction.SAFE_DELETE) destructiveStarted = true;
        try { results.push(await executeOperation(operation, guildId, mode)); }
        catch (error) { results.push(Object.freeze({ actionId: operation.actionId, type: operation.type, target: operation.target, status: ExecutionStatus.FAILED, error })); if (!destructiveStarted) break; }
      }
      return Object.freeze({ operationId: makeOperationId(), planFingerprint: approvedPlan.planFingerprint, mode, startedAt, finishedAt: new Date().toISOString(), preflight, results: Object.freeze(results), summary: summarize(results) });
    }
  });
}

module.exports = { createServerGovernanceExecutionUseCase, preflightGovernanceExecution, prepareGovernanceExecutionPlan };
