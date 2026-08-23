const { ChannelOwnership, GovernanceAction, createGovernanceAction, isProtectedResource } = require('../../domain/community/channelGovernance');
const { assertGuildChannelInventoryPort } = require('./ports/GuildChannelInventoryPort');

function matchResource(resource, desired) {
  if (resource.canonicalKey === desired.key) return 'canonical';
  if (resource.type === desired.type && resource.name === desired.displayName) return 'exact';
  if (resource.type === desired.type && desired.legacyNames.includes(resource.name)) return 'legacy';
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
module.exports = { createServerGovernancePlan, createServerGovernancePlanUseCase };
