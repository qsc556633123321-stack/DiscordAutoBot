const { ChannelOwnership, GovernanceAction, createGovernanceAction, isProtectedResource } = require('../../domain/community/channelGovernance');
const { buildGovernanceReviewManifest } = require('../../domain/community/serverGovernanceReviewManifest');
const { assertGuildChannelInventoryPort } = require('./ports/GuildChannelInventoryPort');

function matchResource(resource, desired) {
  if (resource.canonicalKey === desired.key) return 'canonical';
  if (resource.canonicalKey) return null;
  const parentMatches = resource.type === 'category' || resource.parentCanonicalKey === desired.parentKey;
  if (parentMatches && resource.type === desired.type && resource.name === desired.displayName) return 'exact';
  if (parentMatches && resource.type === desired.type && desired.legacyNames.includes(resource.name)) return 'legacy';
  if (resource.type === desired.type && resource.purpose === desired.purpose && resource.parentCanonicalKey === desired.parentKey) return 'structural';
  return null;
}

function createServerGovernancePlan({ inventory = [], desiredState = { resources: [] } } = {}) {
  const actions = [];
  const consumed = new Set();
  for (const desired of desiredState.resources || []) {
    const candidates = inventory.map((resource, index) => ({ resource, index, match: matchResource(resource, desired) })).filter((item) => item.match);
    if (!candidates.length) { actions.push(createGovernanceAction(GovernanceAction.CREATE, { targetKey: desired.key, reason: 'missing_canonical_resource' })); continue; }
    const canonical = candidates.filter((item) => item.match === 'canonical');
    if (candidates.length > 1 && !(canonical.length === 1 && candidates.every((item) => item.match === 'canonical' || item.match === 'legacy'))) {
      candidates.forEach((item) => consumed.add(item.index));
      actions.push(createGovernanceAction(GovernanceAction.CONFLICT, { targetKey: desired.key, resourceIds: Object.freeze(candidates.map((item) => item.resource.id)), reason: 'ambiguous_duplicate_identity' }));
      continue;
    }
    const winner = canonical[0] || candidates[0];
    consumed.add(winner.index);
    for (const duplicate of candidates.filter((item) => item.index !== winner.index)) { consumed.add(duplicate.index); actions.push(createGovernanceAction(GovernanceAction.SAFE_DELETE, { resourceId: duplicate.resource.id, targetKey: desired.key, reason: 'known_legacy_duplicate_with_canonical_replacement' })); }
    if (winner.resource.parentCanonicalKey !== desired.parentKey) actions.push(createGovernanceAction(GovernanceAction.MOVE, { resourceId: winner.resource.id, targetKey: desired.key, reason: 'wrong_canonical_parent' }));
    if (winner.resource.name !== desired.displayName) actions.push(createGovernanceAction(GovernanceAction.RENAME, { resourceId: winner.resource.id, targetKey: desired.key, reason: 'wrong_canonical_name' }));
    if (winner.resource.accessProfile !== desired.accessProfile || winner.resource.accessRoleKey !== desired.accessRoleKey) actions.push(createGovernanceAction(GovernanceAction.PERMISSION_CHANGE, { resourceId: winner.resource.id, targetKey: desired.key, reason: 'wrong_access_profile' }));
    if (winner.resource.parentCanonicalKey === desired.parentKey && winner.resource.name === desired.displayName && winner.resource.accessProfile === desired.accessProfile && winner.resource.accessRoleKey === desired.accessRoleKey) actions.push(createGovernanceAction(GovernanceAction.KEEP, { resourceId: winner.resource.id, targetKey: desired.key, reason: 'canonical_match' }));
  }
  inventory.forEach((resource, index) => {
    if (consumed.has(index)) return;
    if (isProtectedResource(resource)) actions.push(createGovernanceAction(GovernanceAction.KEEP, { resourceId: resource.id, reason: 'protected_runtime_or_ticket' }));
    else if (resource.migrationReviewReason) actions.push(createGovernanceAction(GovernanceAction.REVIEW_DELETE, { resourceId: resource.id, reason: resource.migrationReviewReason }));
    else if (resource.owner === ChannelOwnership.MANAGED_CANONICAL && resource.lifecycle === 'deprecated' && resource.replacementKey) actions.push(createGovernanceAction(GovernanceAction.SAFE_DELETE, { resourceId: resource.id, targetKey: resource.replacementKey, reason: 'managed_deprecated_replacement_complete' }));
    else if (resource.owner === ChannelOwnership.MANAGED_CANONICAL) actions.push(createGovernanceAction(GovernanceAction.REVIEW_DELETE, { resourceId: resource.id, reason: 'managed_resource_without_replacement_evidence' }));
    else actions.push(createGovernanceAction(GovernanceAction.REVIEW, { resourceId: resource.id, reason: 'unknown_or_user_managed_resource' }));
  });
  return Object.freeze({ actions: Object.freeze(actions) });
}

function createServerGovernancePlanUseCase({ inventoryPort, desiredState } = {}) {
  assertGuildChannelInventoryPort(inventoryPort);
  return Object.freeze({ async previewGuildGovernance({ guildId } = {}) { return createServerGovernancePlan({ inventory: await inventoryPort.readGuildInventory({ guildId }), desiredState }); } });
}

function buildProjectedTree(resources = []) {
  const byParent = new Map();
  for (const resource of resources) {
    const children = byParent.get(resource.parentKey) || [];
    children.push(resource);
    byParent.set(resource.parentKey, children);
  }
  const build = (parentKey = null) => (byParent.get(parentKey) || []).map((resource) => Object.freeze({ key: resource.key, displayName: resource.displayName, type: resource.type, children: Object.freeze(build(resource.key)) }));
  return Object.freeze(build());
}

function buildFullGuildGovernancePreview({ inventory = [], desiredState = { resources: [] }, decisions = [] } = {}) {
  const plan = createServerGovernancePlan({ inventory, desiredState });
  const byAction = Object.fromEntries(Object.values(GovernanceAction).map((action) => [action, []]));
  for (const action of plan.actions) byAction[action.action].push(action);
  const protectedActions = byAction.KEEP.filter((action) => action.reason === 'protected_runtime_or_ticket');
  const summary = Object.freeze({
    keep: byAction.KEEP.length, create: byAction.CREATE.length, move: byAction.MOVE.length, rename: byAction.RENAME.length,
    permissionChange: byAction.PERMISSION_CHANGE.length, safeDelete: byAction.SAFE_DELETE.length, reviewDelete: byAction.REVIEW_DELETE.length,
    review: byAction.REVIEW.length, conflict: byAction.CONFLICT.length, protected: protectedActions.length,
    totals: Object.freeze({ currentResources: inventory.length, desiredResources: desiredState.resources.length, actions: plan.actions.length })
  });
  return Object.freeze({ plan, summary, reviewManifest: buildGovernanceReviewManifest({ plan, inventory, decisions, desiredState }), projectedTree: buildProjectedTree(desiredState.resources), permissionPreview: Object.freeze(desiredState.resources.filter((resource) => resource.accessProfile).map((resource) => Object.freeze({ key: resource.key, accessProfile: resource.accessProfile, accessRoleKey: resource.accessRoleKey }))) });
}

function createFullGuildGovernancePreviewUseCase({ inventoryPort, desiredState } = {}) {
  assertGuildChannelInventoryPort(inventoryPort);
  return Object.freeze({ async previewFullGuildGovernance({ guildId } = {}) { return buildFullGuildGovernancePreview({ inventory: await inventoryPort.readGuildInventory({ guildId }), desiredState }); } });
}
module.exports = { buildFullGuildGovernancePreview, buildProjectedTree, createFullGuildGovernancePreviewUseCase, createServerGovernancePlan, createServerGovernancePlanUseCase };
