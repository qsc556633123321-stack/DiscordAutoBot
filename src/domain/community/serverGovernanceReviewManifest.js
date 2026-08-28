const { GovernanceAction } = require('./channelGovernance');
const { GovernanceReviewApprovalState, getDecisionState } = require('./serverGovernanceReviewDecisionPolicy');


function recommendedAction(action, resource = {}) {
  if (action.action === GovernanceAction.REVIEW_DELETE) {
    if (action.reason === 'legacy_split_compact_game_layout_requires_review') return 'MIGRATE';
    if (action.reason === 'legacy_channel_not_in_voice_only_layout_requires_review') return 'DELETE';
    return 'DELETE';
  }
  if (resource.owner === 'USER_MANAGED') return 'IGNORE_GOVERNANCE';
  return 'REVIEW';
}

function evidenceFor(resource = {}, parent = null) {
  return Object.freeze([
    resource.canonicalKey ? `canonical:${resource.canonicalKey}` : null,
    resource.parentCanonicalKey ? `parentCanonical:${resource.parentCanonicalKey}` : null,
    parent?.id ? `parentId:${parent.id}` : null,
    resource.migrationReviewReason ? `legacy:${resource.migrationReviewReason}` : null,
    resource.owner ? `owner:${resource.owner}` : null,
    resource.lifecycle ? `lifecycle:${resource.lifecycle}` : null
  ].filter(Boolean));
}

function buildGovernanceReviewManifest({ plan = { actions: [] }, inventory = [], decisions = [], desiredState } = {}) {
  const byId = new Map(inventory.map((resource) => [resource.id, resource]));
  const decisionsByResourceId = new Map((decisions || []).map((decision) => [decision.resourceId, decision]));
  let entries = (plan.actions || [])
    .filter((action) => [GovernanceAction.REVIEW, GovernanceAction.REVIEW_DELETE].includes(action.action))
    .filter((action) => byId.has(action.resourceId))
    .map((action) => {
      const resource = byId.get(action.resourceId) || {};
      const parent = resource.parentId ? byId.get(resource.parentId) || null : null;
      const decisionRecord = decisionsByResourceId.get(action.resourceId) || null;
      const decisionState = getDecisionState(resource, decisionRecord);
      return Object.freeze({
        resourceId: action.resourceId || null,
        resourceName: resource.name || 'Unknown resource',
        resourceType: resource.type || 'unknown',
        parentName: parent?.name || null,
        parentId: resource.parentId || null,
        resolvedCanonicalIdentity: resource.canonicalKey || null,
        purpose: resource.purpose || 'unknown',
        ownership: resource.owner || 'UNKNOWN',
        lifecycle: resource.lifecycle || 'unknown',
        reason: action.reason || 'unknown_review_reason',
        recommendedAction: recommendedAction(action, resource),
        approvalState: decisionState,
        decisionState,
        decisionSource: decisionRecord ? 'PERSISTED_REVIEW_DECISION' : 'NONE',
        canonicalTargetKey: decisionRecord?.canonicalTargetKey || null,
        resource,
        evidence: evidenceFor(resource, parent),
        action: action.action
      });
    });
  for (const decision of decisions || []) {
    if (byId.has(decision.resourceId)) continue;
    entries.push(Object.freeze({ resourceId: decision.resourceId, resourceName: decision.resourceNameAtDecision || 'Missing resource', resourceType: 'unknown', parentName: null, parentId: decision.parentIdAtDecision || null, resolvedCanonicalIdentity: null, purpose: 'unknown', ownership: 'UNKNOWN', lifecycle: 'unknown', reason: decision.reasonAtDecision || 'orphaned_decision', recommendedAction: 'RESET', approvalState: 'ORPHANED_DECISION', decisionState: 'ORPHANED_DECISION', decisionSource: 'PERSISTED_REVIEW_DECISION', canonicalTargetKey: decision.canonicalTargetKey || null, resource: null, evidence: Object.freeze(['stored_decision_resource_missing']), action: 'ORPHANED_DECISION' }));
  }
  const adoptionCounts = entries.reduce((counts, entry) => entry.decisionState === GovernanceReviewApprovalState.ADOPT_CANONICAL ? { ...counts, [entry.canonicalTargetKey]: (counts[entry.canonicalTargetKey] || 0) + 1 } : counts, {});
  entries = entries.map((entry) => adoptionCounts[entry.canonicalTargetKey] > 1 ? Object.freeze({ ...entry, approvalState: 'CONFLICT', decisionState: 'CONFLICT', recommendedAction: 'RESOLVE_ADOPTION_CONFLICT' }) : entry);
  const byReason = Object.freeze(Object.fromEntries(Object.entries(entries.reduce((summary, entry) => ({ ...summary, [entry.reason]: (summary[entry.reason] || 0) + 1 }), {})).sort(([left], [right]) => left.localeCompare(right))));
  const byResourceType = Object.freeze(Object.fromEntries(Object.entries(entries.reduce((summary, entry) => ({ ...summary, [entry.resourceType]: (summary[entry.resourceType] || 0) + 1 }), {})).sort(([left], [right]) => left.localeCompare(right))));
  const decisionCounts = Object.freeze(entries.reduce((summary, entry) => ({ ...summary, [entry.decisionState]: (summary[entry.decisionState] || 0) + 1 }), {}));
  return Object.freeze({ entries: Object.freeze(entries), byReason, byResourceType, decisionCounts });
}

module.exports = { GovernanceReviewApprovalState, buildGovernanceReviewManifest };
