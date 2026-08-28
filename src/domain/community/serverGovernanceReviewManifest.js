const { GovernanceAction } = require('./channelGovernance');

const GovernanceReviewApprovalState = Object.freeze({ UNDECIDED: 'UNDECIDED', KEEP: 'KEEP', DELETE: 'DELETE', ADOPT_CANONICAL: 'ADOPT_CANONICAL', IGNORE_GOVERNANCE: 'IGNORE_GOVERNANCE' });

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

function buildGovernanceReviewManifest({ plan = { actions: [] }, inventory = [] } = {}) {
  const byId = new Map(inventory.map((resource) => [resource.id, resource]));
  const entries = (plan.actions || [])
    .filter((action) => [GovernanceAction.REVIEW, GovernanceAction.REVIEW_DELETE].includes(action.action))
    .map((action) => {
      const resource = byId.get(action.resourceId) || {};
      const parent = resource.parentId ? byId.get(resource.parentId) || null : null;
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
        approvalState: GovernanceReviewApprovalState.UNDECIDED,
        evidence: evidenceFor(resource, parent),
        action: action.action
      });
    });
  const byReason = Object.freeze(Object.fromEntries(Object.entries(entries.reduce((summary, entry) => ({ ...summary, [entry.reason]: (summary[entry.reason] || 0) + 1 }), {})).sort(([left], [right]) => left.localeCompare(right))));
  const byResourceType = Object.freeze(Object.fromEntries(Object.entries(entries.reduce((summary, entry) => ({ ...summary, [entry.resourceType]: (summary[entry.resourceType] || 0) + 1 }), {})).sort(([left], [right]) => left.localeCompare(right))));
  return Object.freeze({ entries: Object.freeze(entries), byReason, byResourceType });
}

module.exports = { GovernanceReviewApprovalState, buildGovernanceReviewManifest };
