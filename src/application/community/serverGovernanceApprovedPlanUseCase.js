const { GovernanceAction, isProtectedResource } = require('../../domain/community/channelGovernance');
const { buildFullGuildGovernancePreview } = require('./createServerGovernancePlanUseCase');
const { buildPermissionReconciliation } = require('../../domain/community/serverGovernanceExecutionPolicy');
const { ApprovedOperationType, createApprovedGovernancePlan, createApprovedOperation, decisionSetFingerprint, desiredStateFingerprint, inventoryFingerprint, verifyApprovedGovernancePlan } = require('../../domain/community/serverGovernanceApprovedPlan');
const { GovernanceReviewApprovalState } = require('../../domain/community/serverGovernanceReviewManifest');
const { assertGovernanceApprovedPlanStore } = require('./ports/GovernanceApprovedPlanStore');

const order = Object.freeze({ CREATE_CATEGORY: 10, CREATE_CHANNEL: 20, MOVE_RESOURCE: 30, RENAME_RESOURCE: 40, UPDATE_PERMISSIONS: 50, DELETE_CHANNEL: 60, DELETE_CATEGORY: 70 });
function desiredMap(desiredState) { return new Map((desiredState.resources || []).map((resource) => [resource.key, resource])); }
function snapshot(resource) { return resource ? { id: resource.id, type: resource.type, name: resource.name, parentId: resource.parentId || null, parentCanonicalKey: resource.parentCanonicalKey || resource.parentKey || null, permissionSummary: resource.permissionSummary || [], canonicalKey: resource.canonicalKey || resource.key || null, owner: resource.owner || 'UNKNOWN', lifecycle: resource.lifecycle || 'unknown' } : null; }
function operationId(type, value) { return `${type}:${value}`; }
function operationTypeForCreate(target) { return target.type === 'category' ? ApprovedOperationType.CREATE_CATEGORY : ApprovedOperationType.CREATE_CHANNEL; }
function validateDependencies(operations) {
  const ids = new Set(operations.map((operation) => operation.operationId));
  const blockers = [];
  for (const operation of operations) for (const dependency of operation.dependencies) if (!ids.has(dependency)) blockers.push(`MISSING_DEPENDENCY:${operation.operationId}:${dependency}`);
  const graph = new Map(operations.map((operation) => [operation.operationId, operation.dependencies]));
  const visiting = []; const visited = new Set();
  function visit(id) { if (visiting.includes(id)) { blockers.push(`DEPENDENCY_CYCLE:${id}`); return; } if (visited.has(id)) return; visiting.push(id); for (const dependency of graph.get(id) || []) visit(dependency); visiting.splice(visiting.indexOf(id), 1); visited.add(id); }
  for (const id of graph.keys()) visit(id);
  return blockers;
}
function compileApprovedGovernancePlan({ guildId, compiledBy, inventory = [], desiredState = { resources: [] }, decisions = [], compiledAt = new Date().toISOString() } = {}) {
  const preview = buildFullGuildGovernancePreview({ inventory, desiredState, decisions });
  const manifest = preview.reviewManifest;
  const byId = new Map(inventory.map((resource) => [resource.id, resource]));
  const desired = desiredMap(desiredState);
  const entries = new Map(manifest.entries.map((entry) => [entry.resourceId, entry]));
  const blockers = [...(preview.plan.actions || []).filter((action) => action.action === GovernanceAction.CONFLICT).map((action) => `AMBIGUOUS_CANONICAL_IDENTITY:${action.targetKey}`)];
  for (const entry of manifest.entries) if ([GovernanceReviewApprovalState.UNDECIDED, 'STALE', 'ORPHANED_DECISION', 'CONFLICT'].includes(entry.decisionState)) blockers.push(`REVIEW_${entry.decisionState}:${entry.resourceId}`);
  for (const decision of decisions || []) if (decision.decision === GovernanceReviewApprovalState.DELETE && isProtectedResource(byId.get(decision.resourceId))) blockers.push(`PROTECTED_DESTRUCTIVE_TARGET:${decision.resourceId}`);
  const adoptedTargets = new Set(manifest.entries.filter((entry) => entry.decisionState === GovernanceReviewApprovalState.ADOPT_CANONICAL).map((entry) => entry.canonicalTargetKey));
  const drafts = [];
  function add(type, identity, data) { drafts.push({ type, identity, ...data }); }
  for (const action of preview.plan.actions || []) {
    const current = byId.get(action.resourceId) || null;
    const target = desired.get(action.targetKey) || null;
    const entry = entries.get(action.resourceId);
    if ([GovernanceAction.REVIEW, GovernanceAction.REVIEW_DELETE].includes(action.action)) {
      if (entry?.decisionState === GovernanceReviewApprovalState.DELETE) {
        if (isProtectedResource(current)) blockers.push(`PROTECTED_DESTRUCTIVE_TARGET:${action.resourceId}`);
        else add(current?.type === 'category' ? ApprovedOperationType.DELETE_CATEGORY : ApprovedOperationType.DELETE_CHANNEL, action.resourceId, { resourceId: action.resourceId, current, reason: action.reason, humanDecisionEvidence: entry });
      }
      if (entry?.decisionState === GovernanceReviewApprovalState.ADOPT_CANONICAL) {
        const adoptTarget = desired.get(entry.canonicalTargetKey);
        if (!adoptTarget) { blockers.push(`INVALID_ADOPTION_TARGET:${entry.resourceId}`); continue; }
        if (current?.type !== adoptTarget.type) { blockers.push(`INCOMPATIBLE_ADOPTION_TARGET:${entry.resourceId}`); continue; }
        if (current.name !== adoptTarget.displayName) add(ApprovedOperationType.RENAME_RESOURCE, action.resourceId, { resourceId: action.resourceId, target: adoptTarget, current, reason: 'approved_canonical_adoption', humanDecisionEvidence: entry });
        if ((current.parentCanonicalKey || null) !== (adoptTarget.parentKey || null)) add(ApprovedOperationType.MOVE_RESOURCE, action.resourceId, { resourceId: action.resourceId, target: adoptTarget, current, reason: 'approved_canonical_adoption', humanDecisionEvidence: entry });
        if (current.accessProfile !== adoptTarget.accessProfile || current.accessRoleKey !== adoptTarget.accessRoleKey) add(ApprovedOperationType.UPDATE_PERMISSIONS, action.resourceId, { resourceId: action.resourceId, target: adoptTarget, current, reason: 'approved_canonical_adoption', humanDecisionEvidence: entry });
      }
      continue;
    }
    if (action.action === GovernanceAction.CREATE && adoptedTargets.has(action.targetKey)) continue;
    if (action.action === GovernanceAction.CREATE && target) add(operationTypeForCreate(target), target.key, { canonicalTargetKey: target.key, target, reason: action.reason });
    if (action.action === GovernanceAction.MOVE && target && current) add(ApprovedOperationType.MOVE_RESOURCE, action.resourceId, { resourceId: action.resourceId, target, current, reason: action.reason });
    if (action.action === GovernanceAction.RENAME && target && current) add(ApprovedOperationType.RENAME_RESOURCE, action.resourceId, { resourceId: action.resourceId, target, current, reason: action.reason });
    if (action.action === GovernanceAction.PERMISSION_CHANGE && target && current) add(ApprovedOperationType.UPDATE_PERMISSIONS, action.resourceId, { resourceId: action.resourceId, target, current, reason: action.reason });
    if (action.action === GovernanceAction.SAFE_DELETE && current) {
      if (isProtectedResource(current)) blockers.push(`PROTECTED_DESTRUCTIVE_TARGET:${action.resourceId}`);
      else add(current.type === 'category' ? ApprovedOperationType.DELETE_CATEGORY : ApprovedOperationType.DELETE_CHANNEL, action.resourceId, { resourceId: action.resourceId, current, target, reason: action.reason, replacementEvidence: { canonicalTargetKey: action.targetKey, replacementResource: target || null } });
    }
  }
  for (const draft of [...drafts]) {
    if (![ApprovedOperationType.CREATE_CATEGORY, ApprovedOperationType.CREATE_CHANNEL].includes(draft.type) || !draft.target?.accessProfile) continue;
    add(ApprovedOperationType.UPDATE_PERMISSIONS, `create:${draft.target.key}`, { canonicalTargetKey: draft.target.key, target: draft.target, reason: 'canonical_permission_profile' });
  }
  const createCategories = new Map(drafts.filter((draft) => draft.type === ApprovedOperationType.CREATE_CATEGORY).map((draft) => [draft.canonicalTargetKey, operationId(draft.type, draft.identity)]));
  const operations = drafts.map((draft) => {
    const dependencies = [];
    if ([ApprovedOperationType.CREATE_CHANNEL, ApprovedOperationType.MOVE_RESOURCE].includes(draft.type) && draft.target?.parentKey && createCategories.has(draft.target.parentKey)) dependencies.push(createCategories.get(draft.target.parentKey));
    if (draft.type === ApprovedOperationType.UPDATE_PERMISSIONS && draft.target?.key) {
      const create = drafts.find((candidate) => candidate.canonicalTargetKey === draft.target.key && [ApprovedOperationType.CREATE_CATEGORY, ApprovedOperationType.CREATE_CHANNEL].includes(candidate.type));
      if (create) dependencies.push(operationId(create.type, create.identity));
    }
    if (draft.type === ApprovedOperationType.DELETE_CATEGORY) for (const child of drafts.filter((candidate) => [ApprovedOperationType.DELETE_CHANNEL, ApprovedOperationType.MOVE_RESOURCE].includes(candidate.type) && candidate.current?.parentId === draft.current?.id)) dependencies.push(operationId(child.type, child.identity));
    return createApprovedOperation({ operationId: operationId(draft.type, draft.identity), type: draft.type, resourceId: draft.resourceId, canonicalTargetKey: draft.canonicalTargetKey || draft.target?.key || null, currentSnapshot: snapshot(draft.current), expectedSnapshot: snapshot(draft.target), reason: draft.reason, humanDecisionEvidence: draft.humanDecisionEvidence ? { resourceId: draft.humanDecisionEvidence.resourceId, decision: draft.humanDecisionEvidence.decisionState, canonicalTargetKey: draft.humanDecisionEvidence.canonicalTargetKey } : null, dependencies, permission: draft.type === ApprovedOperationType.UPDATE_PERMISSIONS ? buildPermissionReconciliation(draft.target) : null, replacementEvidence: draft.replacementEvidence });
  });
  blockers.push(...validateDependencies(operations));
  return createApprovedGovernancePlan({ guildId, compiledAt, compiledBy, inventoryFingerprint: inventoryFingerprint(inventory), desiredStateFingerprint: desiredStateFingerprint(desiredState), decisionSetFingerprint: decisionSetFingerprint(decisions), operations: blockers.length ? [] : operations.sort((left, right) => order[left.type] - order[right.type] || left.operationId.localeCompare(right.operationId)), blockedReasons: blockers });
}
function createServerGovernanceApprovedPlanUseCase({ planStore } = {}) {
  assertGovernanceApprovedPlanStore(planStore);
  return Object.freeze({ compile: compileApprovedGovernancePlan, save({ plan, actorId }) { if (plan.status === 'BLOCKED') return Object.freeze({ saved: false, plan }); return Object.freeze({ saved: true, record: planStore.savePlan({ plan, actorId }), plan }); }, verify({ plan, freshInventory, currentDesiredState, currentDecisions, actorId = null }) { const result = verifyApprovedGovernancePlan({ plan, freshInventory, currentDesiredState, currentDecisions }); if (plan?.guildId) planStore.recordVerification({ guildId: plan.guildId, planFingerprint: plan.planFingerprint, result, actorId }); return result; }, latest({ guildId }) { return planStore.loadLatestPlan({ guildId }); }, audit({ guildId }) { return planStore.listAudit({ guildId }); } });
}
module.exports = { compileApprovedGovernancePlan, createServerGovernanceApprovedPlanUseCase, validateDependencies };
