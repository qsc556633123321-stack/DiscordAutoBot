const { permissionFingerprint } = require('./communitySnapshot');

const ReconciliationStatus = Object.freeze({
  MATCHED: 'MATCHED', MISSING_BINDING: 'MISSING_BINDING', STALE_BINDING: 'STALE_BINDING', DUPLICATE_CANDIDATE: 'DUPLICATE_CANDIDATE', AMBIGUOUS_MATCH: 'AMBIGUOUS_MATCH', PERMISSION_DRIFT: 'PERMISSION_DRIFT', UNMANAGED_RESOURCE: 'UNMANAGED_RESOURCE'
});

function issue(status, data = {}) {
  const risk = [ReconciliationStatus.STALE_BINDING, ReconciliationStatus.PERMISSION_DRIFT, ReconciliationStatus.DUPLICATE_CANDIDATE].includes(status) ? 'high' : status === ReconciliationStatus.UNMANAGED_RESOURCE ? 'low' : 'medium';
  return Object.freeze({ status, risk, ...data });
}

function reconcileCommunity({ snapshot, desiredState = { resources: [] }, channelBindings = [] } = {}) {
  const resources = [...(snapshot.categories || []), ...(snapshot.channels || [])];
  const byId = new Map(resources.map((resource) => [resource.id, resource]));
  const bindingsByKey = new Map();
  const bindingsByChannelId = new Map();
  const gameCategoriesByCanonicalId = new Map();
  for (const binding of channelBindings) {
    bindingsByKey.set(binding.canonicalKey, [...(bindingsByKey.get(binding.canonicalKey) || []), binding]);
    bindingsByChannelId.set(binding.discordChannelId, [...(bindingsByChannelId.get(binding.discordChannelId) || []), binding]);
  }
  const issues = [];
  for (const resource of resources) {
    if (resource.type !== 'category' || !resource.gameCanonicalId) continue;
    gameCategoriesByCanonicalId.set(resource.gameCanonicalId, [...(gameCategoriesByCanonicalId.get(resource.gameCanonicalId) || []), resource]);
  }
  for (const [canonicalGameId, categories] of gameCategoriesByCanonicalId) {
    if (categories.length < 2) continue;
    issues.push(issue(ReconciliationStatus.DUPLICATE_CANDIDATE, { canonicalGameId, candidateIds: Object.freeze(categories.map((category) => category.id)), reason: 'multiple_categories_share_canonical_game_id' }));
  }
  for (const desired of desiredState.resources || []) {
    const bindings = bindingsByKey.get(desired.key) || [];
    if (bindings.length > 1) { issues.push(issue(ReconciliationStatus.DUPLICATE_CANDIDATE, { targetKey: desired.key, reason: 'multiple_bindings_for_canonical_key' })); continue; }
    if (!bindings.length) {
      const nameCandidates = resources.filter((resource) => resource.type === desired.type && resource.name === desired.displayName);
      issues.push(issue(nameCandidates.length ? ReconciliationStatus.AMBIGUOUS_MATCH : ReconciliationStatus.MISSING_BINDING, { targetKey: desired.key, candidateIds: Object.freeze(nameCandidates.map((resource) => resource.id)), reason: nameCandidates.length ? 'unbound_name_candidate_requires_review' : 'no_id_binding' }));
      continue;
    }
    const binding = bindings[0];
    const resource = byId.get(binding.discordChannelId);
    if (!resource) { issues.push(issue(ReconciliationStatus.STALE_BINDING, { targetKey: desired.key, channelId: binding.discordChannelId, reason: 'bound_discord_resource_missing' })); continue; }
    if ((binding.permissionFingerprint || null) && binding.permissionFingerprint !== permissionFingerprint(resource.permissionOverwrites)) {
      issues.push(issue(ReconciliationStatus.PERMISSION_DRIFT, { targetKey: desired.key, channelId: resource.id, resourceType: resource.type, reason: 'recorded_permission_fingerprint_differs', permissionComparison: Object.freeze({ recorded: binding.permissionFingerprint, observed: permissionFingerprint(resource.permissionOverwrites) }) }));
      continue;
    }
    issues.push(issue(ReconciliationStatus.MATCHED, { targetKey: desired.key, channelId: resource.id, resourceType: resource.type, reason: 'verified_id_binding_matches' }));
  }
  for (const resource of resources) {
    if (bindingsByChannelId.has(resource.id)) continue;
    issues.push(issue(ReconciliationStatus.UNMANAGED_RESOURCE, { channelId: resource.id, resourceType: resource.type, reason: 'resource_has_no_binding_and_requires_human_classification' }));
  }
  return Object.freeze({ issues: Object.freeze([...issues].sort((left, right) => `${left.risk}:${left.status}:${left.targetKey || left.channelId}`.localeCompare(`${right.risk}:${right.status}:${right.targetKey || right.channelId}`))) });
}

module.exports = { ReconciliationStatus, reconcileCommunity };
